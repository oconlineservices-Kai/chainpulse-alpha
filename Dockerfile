FROM node:20-alpine AS base

# Install dependencies (including devDeps for build tools like tailwindcss)
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json* ./
# Install ALL dependencies (needed for tailwindcss at build time)
RUN npm ci

# Rebuild the source code
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Build-time env vars - runtime values are set via Fly.io secrets
# These placeholders are used for build compilation only
ENV AUTH_SECRET="4a408931926c8a1e249064a44c6a06b7fed8192fc2a34eec8134671e84663356"
ENV NEXTAUTH_SECRET="4a408931926c8a1e249064a44c6a06b7fed8192fc2a34eec8134671e84663356"
ENV NEXTAUTH_URL="https://chainpulsealpha.com"
ENV AUTH_URL="https://chainpulsealpha.com"
ENV NEON_DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Production image — only production deps
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install pm2 globally for process management and signal generator cron
RUN npm install -g pm2

# Create log directory
RUN mkdir -p /var/log/chainpulse && chown nextjs:nodejs /var/log/chainpulse

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy engine and pm2 config
COPY --from=builder --chown=nextjs:nodejs /app/engine ./engine
COPY --from=builder --chown=nextjs:nodejs /app/ecosystem.config.js ./ecosystem.config.js
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start pm2 with ecosystem config (manages both web app and signal generator cron)
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--only", "chainpulse-alpha,signal-generator"]
