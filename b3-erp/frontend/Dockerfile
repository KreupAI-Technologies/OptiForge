# b3-erp frontend — multi-stage build.
#
# The `builder` stage is the memory-hungry one (~7GB peak to compile 1,719
# pages) and runs in CI (GitHub Actions, 16GB runners) — never on Render.
# The final `runner` stage is a tiny standalone Next.js server that Render runs
# with a few hundred MB of RAM.
#
# NEXT_PUBLIC_* are inlined into the client bundle at BUILD time, so they are
# passed as build args here (setting them at runtime on Render would NOT change
# the already-compiled client code).

# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Public API URLs baked into the client bundle. Defaults point at the Render
# NestJS backend; CI overrides via --build-arg if the URL changes.
ARG NEXT_PUBLIC_API_URL=https://b3-erp-backend.onrender.com/api/v1
ARG NEXT_PUBLIC_DOMAIN_API_URL=https://b3-erp-backend.onrender.com/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_DOMAIN_API_URL=${NEXT_PUBLIC_DOMAIN_API_URL} \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# package.json build script already sets --max-old-space-size=8192.
RUN npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# Non-root runtime user (node:alpine ships an unprivileged `node` user).
# Standalone output bundles only the server + the node_modules it actually uses.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
# Render injects $PORT; the standalone server honours PORT + HOSTNAME.
CMD ["node", "server.js"]
