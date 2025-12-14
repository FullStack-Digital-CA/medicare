import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { authConfig } from "./auth.config";

const scryptAsync = promisify(scrypt);

async function verifyPassword(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuff = Buffer.from(hashed, "hex");
  const suppliedBuff = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuff, suppliedBuff);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        try {
          // Allow login with username OR email
          const [user] = await db
            .select()
            .from(users)
            .where(or(eq(users.username, username), eq(users.email, username)))
            .limit(1);

          if (!user) {
            return null;
          }

          if (!user.isActive) {
            return null;
          }

          const isValidPassword = await verifyPassword(password, user.password);

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
});
