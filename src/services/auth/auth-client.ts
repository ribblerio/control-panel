import { createAuthClient } from "better-auth/react";

import { isPresentationModeClient } from "@/utils/presentationMode";

/**
 * Better Auth client instance for client-side authentication.
 *
 * Now talks to the **local** Better-Auth handler at /api/auth (mounted in
 * src/app/api/auth/[...all]/route.ts) instead of the previous external
 * NEXT_PUBLIC_AUTH_URL.
 *
 * baseURL must be a valid absolute URL — Better-Auth validates it via `new
 * URL(...)`. On the client we build it from `window.location.origin`. On the
 * server we use NEXT_PUBLIC_BETTER_AUTH_URL or a localhost fallback (the SSR
 * path through this module is rare; useSession() etc. are client-only).
 *
 * Presentation mode (NEXT_PUBLIC_PRESENTATION_MODE=true) returns null so the
 * static demo deployment of nellavio still works without a backend.
 *
 * Admin plugin (adminClient) should be added here when connecting RBAC.
 */
const baseURL = (() => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }
  const explicit =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL;
  return `${explicit ?? "http://localhost:3000"}/api/auth`;
})();

const authClient =
  typeof window === "undefined" || !isPresentationModeClient()
    ? createAuthClient({ baseURL })
    : null;

/**
 * Authentication methods from Better Auth client.
 *
 * @property {Function} signIn - Sign in with email/password (signIn.email())
 * @property {Function} signUp - Register new user account (signUp.email())
 * @property {Function} signOut - End current session
 * @property {Function} useSession - React hook for session data ({ data, isPending }).
 *   In presentation mode returns a static empty result without fetching.
 */
export const signIn = authClient?.signIn;
export const signUp = authClient?.signUp;
export const signOut = authClient?.signOut;

const emptySession = { data: null, isPending: false, error: null };
export const useSession = authClient?.useSession ?? (() => emptySession);
