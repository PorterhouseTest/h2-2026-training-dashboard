import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : [],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login"
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        (session.user as typeof session.user & { id: string }).id = user.id;
      }
      return session;
    }
  }
};

export async function getUserSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getUserSession();
  if (!session?.user?.email) redirect("/login");
  return session.user;
}
