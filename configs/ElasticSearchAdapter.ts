import type { ESClient } from "@/configs/elasticsearch";
import type { User } from "next-auth";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";

type MyUser = {
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
      const newUser: MyUser = {
        ...user,
        name: user.name ?? "",
        image: user.image ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
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
      return { ..._source, id: _id } as Omit<
        MyUser,
        "createdAt" | "updatedAt" | "password"
      > & { id: string };
    },
    async getUserByEmail(email) {
      const {
        body: { hits },
      } = await esClient.search<MyUser>({
        index: `${index_prefix}_users`,
        size: 1,
        body: {
          _source: {
            excludes: ["createdAt", "updatedAt", "password"],
          },
          query: {
            term: {
              email,
            },
          },
        },
      });
      if (!hits.hits?.[0]?._source) return null;
      const { _source, _id } = hits.hits[0];
      return { ..._source, id: _id } as Omit<
        MyUser,
        "createdAt" | "updatedAt" | "password"
      > & { id: string };
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const {
        body: { _source: account },
      } = await esClient.get<AdapterAccount>({
        index: `${index_prefix}_accounts`,
        id: providerAccountId,
      });
      if (!account) return null;

      const {
        body: { _source: user, _id },
      } = await esClient.get<MyUser>({
        index: `${index_prefix}_users`,
        id: account.userId,
        _source_excludes: ["createdAt", "updatedAt", "password"] as Array<
          keyof MyUser
        >,
      });
      if (!user) return null;
      return { ...user, id: _id } as Omit<
        MyUser,
        "createdAt" | "updatedAt" | "password"
      > & { id: string };
    },
    async updateUser(user) {
      await esClient.update<MyUser>({
        index: `${index_prefix}_users`,
        id: user.id,
        refresh: "wait_for",
        body: {
          doc: user,
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

      return { ..._source, id: _id } as Omit<
        MyUser,
        "createdAt" | "updatedAt" | "password"
      > & { id: string };
    },
    async deleteUser(userId) {
      await esClient.delete({
        index: `${index_prefix}_users`,
        id: userId,
      });
    },
    async linkAccount(account) {
      await esClient.index<AdapterAccount>({
        index: `${index_prefix}_accounts`,
        body: account,
        refresh: "wait_for",
      });
    },
    async unlinkAccount({ providerAccountId, provider }) {
      await esClient.deleteByQuery({
        index: `${index_prefix}_accounts`,
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
      await esClient.index<AdapterSession>({
        id: sessionToken,
        index: `${index_prefix}_sessions`,
        body: {
          sessionToken,
          userId,
          expires,
        },
        refresh: "wait_for",
      });
      return { sessionToken, userId, expires };
    },
    async getSessionAndUser(sessionToken) {
      const {
        body: { _source: session },
      } = await esClient.get<AdapterSession>({
        index: `${index_prefix}_sessions`,
        id: sessionToken,
      });
      if (!session) return null;
      const {
        body: { _source: user },
      } = await esClient.get<MyUser>({
        index: `${index_prefix}_users`,
        id: session.userId,
        _source_excludes: ["createdAt", "updatedAt", "password"] as Array<
          keyof MyUser
        >,
      });
      if (!user) return null;
      return {
        session: { ...session, id: sessionToken },
        user: { ...user, id: session.userId },
      };
    },
    async updateSession({ sessionToken, expires, userId }) {
      const { body } = await esClient.update<AdapterSession>({
        index: `${index_prefix}_sessions`,
        id: sessionToken,
        refresh: "wait_for",
        body: {
          doc: {
            expires,
            userId,
          },
        },
      });
      const newSession = body.get?._source;
      return newSession;
    },
    async deleteSession(sessionToken) {
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
