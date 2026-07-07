import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';

const authBaseURL =
  import.meta.env.VITE_AUTH_URL ||
  (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
