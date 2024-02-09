import NextAuth from "next-auth";
import type { JWT as P } from "next-auth";
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
  interface JWT {
    accessToken?: string;
  }
}
