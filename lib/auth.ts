import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

// Helper function to get IP address and user agent from request
async function getRequestInfo(): Promise<{ ipAddress: string | null; userAgent: string | null }> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ipAddress = 
      forwardedFor?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;
    const userAgent = headersList.get("user-agent") || null;
    return { ipAddress, userAgent };
  } catch (e) {
    // Fallback if headers not available
    return { ipAddress: null, userAgent: null };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        // Get IP address and user agent for logging
        const { ipAddress, userAgent } = await getRequestInfo();

        if (!isPasswordValid) {
          // Log failed login attempt
          try {
            await db.loginLog.create({
              data: {
                userId: user.id,
                username: user.email,
                loginTime: new Date(),
                loginDate: new Date(),
                loginStatus: "FAILED",
                failureReason: "Invalid password",
                ipAddress: ipAddress,
                userAgent: userAgent,
              },
            });
          } catch (error) {
            console.error("Failed to log login attempt:", error);
          }
          throw new Error("Invalid credentials");
        }

        // Log successful login
        try {
          await db.loginLog.create({
            data: {
              userId: user.id,
              username: user.email,
              loginTime: new Date(),
              loginDate: new Date(),
              loginStatus: "SUCCESS",
              ipAddress: ipAddress,
              userAgent: userAgent,
            },
          });
        } catch (error) {
          console.error("Failed to log login attempt:", error);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null | undefined;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

