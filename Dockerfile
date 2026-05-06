FROM node:22-alpine AS deps
WORKDIR /app
ENV HUSKY=0
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts

FROM node:22-alpine AS build
WORKDIR /app
ENV HUSKY=0
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder env values for `next build` page-data collection. Routes that
# import @/lib/auth/server.ts throw at import time if DATABASE_URL is missing,
# which next 16 runs during build to assemble the route manifest. The real
# values come from docker-compose at runtime.
ENV DATABASE_URL=postgres://placeholder:placeholder@placeholder:5432/placeholder
ENV BETTER_AUTH_SECRET=build-time-placeholder
ENV BETTER_AUTH_URL=http://localhost:3000
ENV JWT_SECRET=build-time-placeholder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
