import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from './db.js';
import { user, session, account, verification, jwks } from '../db/index.js';
import { env } from './env.js';
import { emailQueue } from './queues.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
      jwks,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: `http://localhost:${env.PORT}`,
  basePath: '/api/auth',
  trustedOrigins: [env.WEB_ORIGIN, env.ADMIN_ORIGIN],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user: resetUser, url }) => {
      await emailQueue.add('password-reset', {
        to: resetUser.email,
        userName: resetUser.name,
        url,
        type: 'password-reset',
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user: verifyUser, url }) => {
      await emailQueue.add('email-verification', {
        to: verifyUser.email,
        userName: verifyUser.name,
        url,
        type: 'email-verification',
      });
    },
    sendOnSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false,
      },
    },
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === 'production',
  },
  plugins: [jwt()],
});
