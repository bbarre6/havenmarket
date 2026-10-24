import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isSeller: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isSeller?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isSeller?: boolean;
  }
}
