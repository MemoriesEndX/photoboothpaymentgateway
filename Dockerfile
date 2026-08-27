# ==============================================================================
# Photobooth Application — Production Multi-Stage Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base foundation
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base

# Install libc6-compat for Alpine musl compatibility (Prisma engine, native binaries)
RUN apk add --no-cache libc6-compat

# Prefer IPv4 resolution order in Node.js and use official nodejs CDN for node-gyp headers
ENV NODE_OPTIONS="--dns-result-order=ipv4first" \
    npm_config_disturl="https://nodejs.org/dist"

WORKDIR /app

# ------------------------------------------------------------------------------
# Stage 2: Dependencies
# ------------------------------------------------------------------------------
FROM base AS deps

# Install build dependencies required for native modules (e.g. bcrypt)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000

# ------------------------------------------------------------------------------
# Stage 3: Builder
# ------------------------------------------------------------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy build-time DATABASE_URL to allow Next.js route collection without active DB
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NODE_OPTIONS="--dns-result-order=ipv4first" \
    DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"

# Generate Prisma Client & Build Next.js application
RUN npx prisma generate
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Production Runner
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat wget

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# Copy node_modules and build artifacts
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy entrypoint script for automatic migrations
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Ensure storage directories exist and ownership belongs to non-root node user (uid 1000)
RUN mkdir -p /app/public/uploads /app/public/gallery \
 && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:3000/login || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
