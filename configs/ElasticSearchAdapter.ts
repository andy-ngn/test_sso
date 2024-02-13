import type { ESClient } from "@/configs/elasticsearch";
import type { User } from "next-auth";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";
import { fromUnixTime, getUnixTime } from "date-fns";

export type MyUser = {
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: Date | null;
  name?: string | null | undefined;
  image?: string | null | undefined;
  role: "admin" | "user" | "guest";
  password?: string | null;
};
export function ElasticSearchAdapter(
  esClient: ESClient,
  index_prefix: string = "test"
): Adapter {
  return {
    async createUser(user) {
      console.log("createUser");
      const newUser: MyUser = {
        ...user,
        name: user.name ?? "",
        image: user.image ?? "",
        createdAt: getUnixTime(new Date()) as unknown as Date,
        updatedAt: getUnixTime(new Date()) as unknown as Date,
        role: "admin",
      };
      const { body } = await esClient.index<typeof newUser>({
        index: `${index_prefix}_users`,
        body: newUser,
        refresh: "wait_for",
      });
      const id = body._id;

      return { ...user, id };
    },
    async getUser(id) {
      console.log("getUser");
      const {
        body: { _source, _id },
      } = await esClient.get<MyUser>({
        index: `${index_prefix}_users`,
        id,
        _source_excludes: ["createdAt", "updatedAt", "password"] as Array<
          keyof MyUser
        >,
      });
      if (!_source) return null;
      return {
        ..._source,
        emailVerified: _source.emailVerified
          ? fromUnixTime(+_source.emailVerified as number)
          : null,
        id: _id,
      } as Omit<MyUser, "createdAt" | "updatedAt" | "password"> & {
        id: string;
      };
    },
    async getUserByEmail(email) {
      console.log("getUserByEmail");
      return await esClient
        .search<MyUser>({
          index: `${index_prefix}_users`,
          size: 1,
          body: {
            _source: {
              excludes: ["createdAt", "updatedAt", "password"],
            },
            query: {
              match: {
                email,
              },
            },
          },
        })
        .then(({ body: { hits } }) => {
          if (!hits.hits?.[0]?._source) return null;
          const { _source, _id } = hits.hits[0];
          return {
            ..._source,
            emailVerified: _source.emailVerified
              ? fromUnixTime(+_source.emailVerified as number)
              : null,
            id: _id,
          } as Omit<MyUser, "createdAt" | "updatedAt" | "password"> & {
            id: string;
          };
        })
        .catch((e) => {
          console.error("getUserByEmail error", e);
          return null;
        });
    },
    async getUserByAccount({ providerAccountId, provider }) {
      console.log("getUserByAccount");
      const userId = await esClient
        .search<AdapterAccount>({
          index: `${index_prefix}_accounts`,
          size: 1,
          body: {
            query: {
              bool: {
                must: [
                  {
                    term: {
                      providerAccountId,
                    },
                  },
                  {
                    term: {
                      provider,
                    },
                  },
                ],
              },
            },
          },
        })
        .then((res) => {
          if (!res.body.hits?.hits?.[0]?._source) return null;
          return res.body.hits.hits[0]._source.userId;
        })
        .catch((e) => {
          console.error(e);
          return null;
        });
      if (!userId) return null;

      return await esClient
        .get<MyUser>({
          index: `${index_prefix}_users`,
          id: userId,
          _source_excludes: ["createdAt", "updatedAt", "password"] as Array<
            keyof MyUser
          >,
        })
        .then(({ body: { _source: user, _id } }) => {
          if (!user) return null;
          return {
            ...user,
            emailVerified: user.emailVerified
              ? fromUnixTime(+user.emailVerified as number)
              : null,
            id: _id,
          } as Omit<MyUser, "createdAt" | "updatedAt" | "password"> & {
            id: string;
          };
        })
        .catch((e) => {
          console.error(e);
          return null;
        });
    },
    async updateUser(user) {
      console.log("updateUser");
      await esClient.update<MyUser>({
        index: `${index_prefix}_users`,
        id: user.id,
        refresh: "wait_for",
        body: {
          doc: {
            ...user,
            updatedAt: getUnixTime(new Date()) as unknown as Date,
          },
        },
      });
      const {
        body: { _source, _id },
      } = await esClient.get<MyUser>({
        index: `${index_prefix}_users`,
        id: user.id,
        _source_excludes: ["createdAt", "updatedAt", "password"] as Array<
          keyof MyUser
        >,
      });

      return {
        ..._source,
        emailVerified: _source?.emailVerified
          ? fromUnixTime(+_source.emailVerified as number)
          : null,
        id: _id,
      } as Omit<MyUser, "createdAt" | "updatedAt" | "password"> & {
        id: string;
      };
    },
    async deleteUser(userId) {
      console.log("deleteUser");
      await esClient.delete({
        index: `${index_prefix}_users`,
        id: userId,
      });
    },
    async linkAccount(account) {
      console.log("linkAccount");
      await esClient.index<AdapterAccount>({
        index: `${index_prefix}_accounts`,
        body: account,
        refresh: "wait_for",
      });
    },
    async unlinkAccount({ providerAccountId, provider }) {
      console.log("unlinkAccount");
      await esClient.deleteByQuery({
        index: `${index_prefix}_accounts`,
        refresh: true,
        body: {
          query: {
            bool: {
              must: [
                {
                  term: {
                    providerAccountId,
                  },
                },
                {
                  term: {
                    provider,
                  },
                },
              ],
            },
          },
        },
      });
    },
    async createSession({ sessionToken, userId, expires }) {
      console.log("createSession");
      await esClient.index<AdapterSession>({
        index: `${index_prefix}_sessions`,
        id: sessionToken,
        body: {
          sessionToken,
          userId,
          expires: getUnixTime(expires) as unknown as Date,
        },
        refresh: "wait_for",
      });
      return { sessionToken, userId, expires };
    },
    async getSessionAndUser(sessionToken) {
      console.log("getSessionAndUser");
      const session = await esClient
        .get<AdapterSession>({
          index: `${index_prefix}_sessions`,
          id: sessionToken,
        })
        .then(({ body: { _source } }) => {
          if (!_source) return null;
          return _source;
        })
        .catch((e) => {
          console.error("getSession Error: ", e);
          return null;
        });
      if (!session) return null;
      const user = await esClient
        .get<MyUser>({
          index: `${index_prefix}_users`,
          id: session.userId,
          _source_excludes: ["createdAt", "updatedAt", "password"] as Array<
            keyof MyUser
          >,
        })
        .then((res) => {
          if (!res.body._source) return null;
          return { ...res.body._source, id: res.body._id } as Omit<
            MyUser,
            "createdAt" | "updatedAt" | "password"
          > & { id: string };
        });

      if (!user) return null;
      console.log("HERE: ", { session, user });
      return {
        session: {
          ...session,
          expires: fromUnixTime(+session.expires),
        },
        user: { ...user },
      };
    },
    async updateSession({ sessionToken, ...rest }) {
      console.log("updateSession");
      await esClient.update<AdapterSession>({
        index: `${index_prefix}_sessions`,
        id: sessionToken,
        refresh: "wait_for",
        body: {
          doc: {
            ...rest,
            ...(!!rest.expires && {
              expires: getUnixTime(rest.expires) as unknown as Date,
            }),
          },
        },
      });

      const newSession = await esClient.get<AdapterSession>({
        index: `${index_prefix}_sessions`,
        id: sessionToken,
      });
      if (!newSession.body._source) return null;
      return {
        ...newSession.body._source,
        expires: fromUnixTime(+newSession.body._source.expires),
      };
    },
    async deleteSession(sessionToken) {
      console.log("deleteSession");
      console.log("deleteSession", sessionToken);
      await esClient.delete({
        index: `${index_prefix}_sessions`,
        id: sessionToken,
      });
    },

    // async createVerificationToken({ identifier, expires, token }) {
    //   return dfVerificationToken;
    // },
    // async useVerificationToken({ identifier, token }) {
    //   return dfVerificationToken;
    // },
  };
}
