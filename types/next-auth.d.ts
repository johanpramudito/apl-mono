// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number; // ganti jadi string kalau id kamu bukan number
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: number;
  }
}
