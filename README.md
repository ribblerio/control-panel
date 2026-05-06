# Ribbler · Control Panel

Admin UI for Ribbler. Forked from [nellavio](https://github.com/nellavio/nellavio) (MIT, v2.0.1).
Talks to `ribbler/core-module` for all data — no business logic in this repo.

## Dev

```bash
npm install
cp .env.example .env.local   # fill in BETTER_AUTH_SECRET, JWT_SECRET, CORE_MODULE_URL
npm run dev                  # http://localhost:3000
```

## Architecture

- All API calls go through `/api/proxy/[...path]` which mints a short-lived JWT and forwards to `core-module`.
- Next.js API routes are reserved for the Better-Auth handler only — no business logic.
- TanStack Query owns server state (replacing Apollo from upstream nellavio).

## License

MIT — original copyright nellavio contributors; modifications copyright Ribbler contributors.
