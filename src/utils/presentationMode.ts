/**
 * Presentation Mode Detection Utilities
 *
 * Used by nellavio to render the static demo without a backend. In Ribbler,
 * auth is now local (Better-Auth talks to Postgres directly via /api/auth),
 * so we no longer probe NEXT_PUBLIC_AUTH_URL to decide whether auth is
 * available — it always is in this codebase.
 *
 * Presentation mode is now an explicit opt-in:
 *   - Server: GRAPHQL_URL unset → no GraphQL backend → presentation mode.
 *   - Client: NEXT_PUBLIC_PRESENTATION_MODE === "true" → demo mode.
 *
 * (The legacy hasValidAuthUrl() / isAuthAvailable() helpers are kept for
 * the existing test suite and any consumers that read NEXT_PUBLIC_AUTH_URL
 * directly. They should be considered deprecated.)
 */

/**
 * Check if backend GraphQL URL is configured and valid
 */
export const hasValidBackendUrl = (): boolean => {
  const url = process.env.GRAPHQL_URL;
  return !!url && (url.startsWith("http://") || url.startsWith("https://"));
};

/**
 * Legacy: check if NEXT_PUBLIC_AUTH_URL is configured. Kept for tests; not
 * load-bearing anymore now that auth is local.
 */
export const hasValidAuthUrl = (): boolean => {
  const url = process.env.NEXT_PUBLIC_AUTH_URL;
  return !!url && (url.startsWith("http://") || url.startsWith("https://"));
};

/**
 * Check if app is running in presentation mode (no backend)
 * Server-side detection.
 */
export const isPresentationMode = (): boolean => {
  return !hasValidBackendUrl();
};

/**
 * Legacy: whether NEXT_PUBLIC_AUTH_URL is set. Auth is now always available
 * via the local handler, but kept for back-compat.
 */
export const isAuthAvailable = (): boolean => {
  return hasValidAuthUrl();
};

/**
 * Client-side presentation mode detection.
 *
 * Auth is local now, so the only way the client side enters presentation
 * mode is the explicit NEXT_PUBLIC_PRESENTATION_MODE=true flag. Defaults
 * to false (full app, real auth, real backend).
 */
export const isPresentationModeClient = (): boolean => {
  if (typeof window === "undefined") return false;
  return process.env.NEXT_PUBLIC_PRESENTATION_MODE === "true";
};
