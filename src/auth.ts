// @ts-ignore
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        
        let user = await db.user.findUnique({ where: { email } });

        // MODO PRUEBA: Si el usuario no existe, lo creamos automáticamente
        if (!user) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user = await db.user.create({
            data: {
              email,
              name: email.split("@")[0],
              password: hashedPassword,
              role: "USER",
              plan: "FREE",
            },
          });
          return user;
        }

        if (!user.password) return null;
        if (user.banned) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.plan = session.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).plan = token.plan;
      }
      return session;
    },
  },
});
