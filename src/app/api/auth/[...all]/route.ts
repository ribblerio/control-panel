import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/server";

/**
 * Better-Auth catch-all route.
 *
 * Mounts every Better-Auth endpoint (sign-in, sign-up, sign-out, get-session,
 * etc.) at /api/auth/*. Replaces the previous external NEXT_PUBLIC_AUTH_URL
 * setup.
 */
export const { POST, GET } = toNextJsHandler(auth);
