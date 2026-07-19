import { betterAuth } from "better-auth";
import { jwt, bearer } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    // Better Auth can connect to mongodb via string or custom driver. We will just use the string.
    provider: "mongodb",
    url: process.env.MONGODB_URI as string,
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    jwt({
      jwt: {
        definePayload: (session) => {
          return {
            id: session.user.id,
            email: session.user.email,
          };
        }
      }
    }),
    bearer(),
  ],
  secret: process.env.BETTER_AUTH_SECRET as string,
});

export const { GET, POST } = auth.handler;