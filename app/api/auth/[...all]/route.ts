import { betterAuth } from "better-auth";
import { jwt, bearer } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { toNextJsHandler } from "better-auth/next-js";

const client = new MongoClient(process.env.MONGODB_URI as string);

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
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

export const { GET, POST } = toNextJsHandler(auth.handler);