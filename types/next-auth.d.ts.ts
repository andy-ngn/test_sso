import NextAuth from "next-auth";
import type { DefaultSession, DefaultUser, JWT as P } from "next-auth";
declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    user: DefaultUser & {
      userId?: string;
    };
  }
  interface JWT {
    accessToken?: string;
  }
}
