import createClient from "openapi-fetch";

import type { paths } from "./schema";

/**
 * Type-safe fetch client backed by the openapi-fetch lib and our generated
 * `schema.ts`. Calls hit Next.js's `/api/proxy/[...path]` route, which
 * forwards to core-module with a freshly-minted JWT.
 *
 * @example
 * const { data, error } = await api.GET("/me");
 */
export const api = createClient<paths>({ baseUrl: "/api/proxy" });
