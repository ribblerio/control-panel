import { NextRequest, NextResponse } from "next/server";

import { mintJwt } from "@/lib/jwt";
import { getSession } from "@/services/auth/auth-server";

const CORE = process.env.CORE_MODULE_URL ?? "http://localhost:8787";

/**
 * Server-side proxy: browser → Next.js route → core-module.
 *
 * 1. Reads the Better-Auth session via `getSession()` (which forwards
 *    cookies to NEXT_PUBLIC_AUTH_URL/get-session).
 * 2. Mints a 60-second HS256 JWT signed with JWT_SECRET (must match
 *    core-module/.env JWT_SECRET).
 * 3. Forwards the request to CORE_MODULE_URL with the Bearer token.
 *
 * MVP: role is hardcoded to "admin" until role flows through Better-Auth.
 */
async function handle(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;

  const sessionData = await getSession();
  if (!sessionData?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = sessionData.user as {
    id: string;
    email: string;
  };

  const jwt = await mintJwt({
    userId: user.id,
    email: user.email,
    role: "admin",
  });

  const url = new URL(req.url);
  const target = `${CORE}/${path.join("/")}${url.search}`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${jwt}`);
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const upstream = await fetch(target, init);
  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
export const PUT = handle;
