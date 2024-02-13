import { AuthOptions } from "next-auth";
import { ElasticSearchAdapter, MyUser } from "./ElasticSearchAdapter";
import esClient from "./elasticsearch";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import "@next-auth/prisma-adapter";
import { fromUnixTime } from "date-fns";
const mode = process.env.NODE_ENV;
import bcrypt from "bcryptjs";
// import { randomBytes, randomUUID } from "crypto";
// import { AdapterSession } from "next-auth/adapters";
const index_prefix = "test_sso";
export const authOptions: AuthOptions = {
  // adapter: PrismaAdapter(prisma),
  adapter: ElasticSearchAdapter(esClient, "test_sso"),

  debug: mode === "development" && false,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "email",
          type: "email",
          placeholder: "Email@mail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // console.log("authorize", credentials);
        if (!credentials?.password || !credentials.email) {
          return null;
        }
        return await esClient
          .search<MyUser>({
            index: `${index_prefix}_users`,
            size: 1,
            body: {
              _source: {
                excludes: ["createdAt", "updatedAt"],
              },
              query: {
                match: {
                  email: credentials.email,
                },
              },
            },
          })
          .then(({ body: { hits } }) => {
            if (!hits.hits?.[0]?._source?.password) return null;
            const { _source, _id } = hits.hits[0];

            const match =
              !!_source.password &&
              bcrypt.compare(credentials.password, _source.password);
            if (!match) {
              return null;
            }
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

      type: "credentials",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    newUser: "/newUser",
  },
  callbacks: {
    async signIn({ user, account, profile, credentials, email }) {
      // console.log({ user, account, profile, credentials, email });
      // if (account?.provider === "credentials") {
      //   const sessionToken = randomUUID?.() ?? randomBytes(32).toString("hex");
      //   const userId = user.id;
      //   const expires = getUnixTime(new Date()) + 30 * 24 * 60 * 60;
      //   await esClient.index<AdapterSession>({
      //     index: `${index_prefix}_sessions`,
      //     id: sessionToken,
      //     body: {
      //       sessionToken,
      //       userId,
      //       expires: getUnixTime(expires) as unknown as Date,
      //     },
      //     refresh: "wait_for",
      //   });
      // }

      return true;
    },

    async redirect({ baseUrl, url }) {
      return url;
    },
    async jwt({ token, user, account, profile, session }) {
      // console.log({ token, user, account, profile, session });

      return token;
    },

    async session({ session, token, newSession, trigger, user }) {
      // console.log({ session, token, newSession, trigger, user });
      if (token?.sub) {
        session.user.userId = token.sub;
      }
      return session;
    },
  },

  events: {
    createUser: async (message) => {
      // console.log("createUser", message);
    },
    updateUser: async (message) => {
      console.log("updateUser", message);
    },
    linkAccount: async (message) => {
      console.log("linkAccount", message);
    },
    session: async (message) => {
      console.log("session", message);
    },
    signIn: async (message) => {
      console.log("signIn", message);
    },
    signOut: async (message) => {
      console.log("signOut", message);
    },
  },
};
