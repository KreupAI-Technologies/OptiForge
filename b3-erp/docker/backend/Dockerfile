# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching). The postinstall hook runs
# `prisma generate`, so the schema must be present before npm ci.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install only production dependencies. The postinstall hook runs
# `prisma generate`, which needs the schema — copy prisma/ BEFORE npm ci.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --only=production

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Create a non-root user for security
# Alpine already has a 'node' user
USER node

# Expose backend port (NestJS reads PORT env var at runtime; default 3001 per ADR-0004).
ENV PORT=3001
EXPOSE 3001

# Health check using Terminus endpoint on $PORT
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3001) + '/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Run the application
CMD ["node", "dist/main"]
