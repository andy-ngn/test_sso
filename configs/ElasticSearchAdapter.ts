import { User } from "next-auth";
import type {
  Adapter,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";

const dfUser: AdapterUser = {
  id: "",
  email: "",
  name: "",
  image: "",
  emailVerified: new Date(),
};
const dfSession: AdapterSession = {
  userId: "",
  expires: new Date(),
  sessionToken: "",
};
const dfVerificationToken: VerificationToken = {
  expires: new Date(),
  identifier: "",
  token: "",
};
export function ElasticSearchAdapter(): Adapter {
  return {
    async createUser(user) {
      return dfUser;
    },
    async getUser(id) {
      return dfUser;
    },
    async getUserByEmail(email) {
      return dfUser;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      return dfUser;
    },
    async updateUser(user) {
      return dfUser;
    },
    async deleteUser(userId) {},
    async linkAccount(account) {},
    async unlinkAccount({ providerAccountId, provider }) {},
    async createSession({ sessionToken, userId, expires }) {
      return dfSession;
    },
    async getSessionAndUser(sessionToken) {
      return {
        session: dfSession,
        user: dfUser,
      };
    },
    async updateSession({ sessionToken }) {
      return dfSession;
    },
    async deleteSession(sessionToken) {},
    async createVerificationToken({ identifier, expires, token }) {
      return dfVerificationToken;
    },
    async useVerificationToken({ identifier, token }) {
      return dfVerificationToken;
    },
  };
}
