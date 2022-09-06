import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      address: string | undefined;
      name: string | undefined;
      image: string;
      test: string;
      role: string;
      [key: string]: string;
    };
  }
}
