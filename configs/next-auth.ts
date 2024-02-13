import { AuthOptions } from "next-auth";
import { ElasticSearchAdapter } from "./ElasticSearchAdapter";
import esClient from "./elasticsearch";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import "@next-auth/prisma-adapter";
const mode = process.env.NODE_ENV;
export const authOptions: AuthOptions = {
  // adapter: PrismaAdapter(prisma),
  adapter: ElasticSearchAdapter(esClient, "test_sso"),
  debug: false,
  // debug: mode === "development",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "email",
          type: "email",
          placeholder: "Email@mail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const user = { id: "1as", name: "J Smith", email: "" };
        if (user) {
          return user;
        } else {
          return null;
        }
      },
      type: "credentials",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    newUser: "/newUser",
  },
  // callbacks: {
  //   async signIn({ user, account, profile, credentials, email }) {
  //     console.log({ user, account, profile, credentials, email });
  //     return true;
  //   },
  //   async redirect({ baseUrl, url }) {
  //     return url;
  //   },

  //   async session({ session, token, newSession, trigger, user }) {
  //     return session;
  //   },
  // },

  events: {
    createUser: async (message) => {
      console.log("createUser", message);
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
