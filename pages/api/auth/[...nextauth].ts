import NextAuth, { type AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { PrismaClient } from "@prisma/client";
import type { NextApiHandler } from "next";

import { getToken } from "next-auth/jwt";
import { ElasticSearchAdapter } from "@/configs/ElasticSearchAdapter";
const prisma = new PrismaClient();
const mode = process.env.NODE_ENV;
const oAuths = [
  {
    provider: "github",
    type: "oauth",
    providerAccountId: "121242836",
    userID: "9919345",
    access_token: "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",
  },
];
const accounts = [
  {
    id: "9919345",
    name: "J Smith",
    email: "n.christian345@gmail.com",
    password: "14121502",
    image: "https://github.com/shadcn.png",
    org_id: "office_mesh",
  },
];
export const authOptions: AuthOptions = {
  // adapter: PrismaAdapter(prisma),
  adapter: ElasticSearchAdapter(),
  debug: mode === "development",
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
        const user = accounts.find(
          (user) =>
            user.email === credentials?.username &&
            user?.password === credentials.password
        );
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
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, credentials, email }) {
      console.log({ user, account, profile, credentials, email });
      return true;
    },
    async redirect({ baseUrl, url }) {
      return url;
    },

    async session({ session, token, newSession, trigger, user }) {
      return session;
    },
  },
  events: {},
};

const handler: NextApiHandler = async (req, res) => {
  return await NextAuth(req, res, {
    ...authOptions,
    callbacks: {
      ...authOptions.callbacks,
      async jwt({ token, account, user, profile, session, trigger }) {
        const jwt = await getToken({ req });
        console.log({ jwt, account });
        if (jwt) {
          return jwt;
        }

        // if (account) {
        //   const oauthAccount = oAuths.find(
        //     (oauth) => oauth.providerAccountId === account?.providerAccountId
        //   );

        //   if (oauthAccount) {
        //     const thisUser = accounts.find(
        //       (us) => us.id === oauthAccount.userID
        //     );

        //     if (thisUser) {
        //       const { password, ...rest } = thisUser;
        //       token = { ...token, ...rest };
        //     }
        //   }
        // }
        return token;
      },
    },
  });
};
export default handler;

const payload = {
  token: {
    name: "andy-ngn",
    email: "andy@ariadnemaps.com",
    picture: "https://avatars.githubusercontent.com/u/121242836?v=4",
    sub: "clsf4ic0e000010tu6rs7bky0",
  },
  account: {
    provider: "github",
    type: "oauth",
    providerAccountId: "121242836",
    access_token: "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",
    token_type: "bearer",
    scope: "read:user,user:email",
  },
  user: {
    id: "clsf4ic0e000010tu6rs7bky0",
    name: "andy-ngn",
    email: "andy@ariadnemaps.com",
    emailVerified: null,
    image: "https://avatars.githubusercontent.com/u/121242836?v=4",
  },
  profile: {
    login: "andy-ngn",
    id: 121242836,
    node_id: "U_kgDOBzoE1A",
    avatar_url: "https://avatars.githubusercontent.com/u/121242836?v=4",
    gravatar_id: "",
    url: "https://api.github.com/users/andy-ngn",
    html_url: "https://github.com/andy-ngn",
    followers_url: "https://api.github.com/users/andy-ngn/followers",
    following_url:
      "https://api.github.com/users/andy-ngn/following{/other_user}",
    gists_url: "https://api.github.com/users/andy-ngn/gists{/gist_id}",
    starred_url: "https://api.github.com/users/andy-ngn/starred{/owner}{/repo}",
    subscriptions_url: "https://api.github.com/users/andy-ngn/subscriptions",
    organizations_url: "https://api.github.com/users/andy-ngn/orgs",
    repos_url: "https://api.github.com/users/andy-ngn/repos",
    events_url: "https://api.github.com/users/andy-ngn/events{/privacy}",
    received_events_url:
      "https://api.github.com/users/andy-ngn/received_events",
    type: "User",
    site_admin: false,
    name: null,
    company: null,
    blog: "",
    location: null,
    email: "andy@ariadnemaps.com",
    hireable: null,
    bio: null,
    twitter_username: null,
    public_repos: 7,
    public_gists: 0,
    followers: 2,
    following: 2,
    created_at: "2022-12-22T14:35:38Z",
    updated_at: "2024-02-09T19:08:45Z",
    private_gists: 0,
    total_private_repos: 1,
    owned_private_repos: 1,
    disk_usage: 18992,
    collaborators: 0,
    two_factor_authentication: false,
    plan: {
      name: "free",
      space: 976562499,
      collaborators: 0,
      private_repos: 10000,
    },
  },
  session: undefined,
  trigger: "signIn",
};
