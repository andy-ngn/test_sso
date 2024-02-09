import NextAuth, { type AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
export const authOptions: AuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  // session: {
  //   strategy: "database",
  // },
  // callbacks: {
  //   async jwt({ token, account }) {
  //     if (account) {
  //       token.accessToken = account.access_token;
  //     }
  //     return token;
  //   },
  //   async session({ session, token }) {
  //     if (token.accessToken) {
  //       session.accessToken = token.accessToken as string;
  //     }

  //     return session;
  //   },
  // },
};

export default NextAuth(authOptions);
