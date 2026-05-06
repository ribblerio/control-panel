import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";

/**
 * Server-side session retrieval via Better Auth.
 *
 * Used to call `${NEXT_PUBLIC_AUTH_URL}/get-session` over HTTP. Now delegates
 * to the local Better-Auth instance (src/lib/auth/server.ts) — same return
 * shape (`{ user, session } | null`), so existing callers keep working.
 */
export const getSession = async () => {
  try {
    const headersList = await headers();
    const result = await auth.api.getSession({ headers: headersList });
    return result?.user ? result : null;
  } catch (error: unknown) {
    // Re-throw Next.js internal errors (e.g. DYNAMIC_SERVER_USAGE from
    // calling headers() at build time) so the framework can handle them
    // silently instead of flooding the build output with false errors.
    if (error instanceof Error && "digest" in error) {
      throw error;
    }

    console.error("Failed to get session:", error);
    return null;
  }
};
