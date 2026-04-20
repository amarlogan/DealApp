# --- Build Stage ---
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root configs for monorepo
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
# (Optional) Copy other services if needed
# COPY services/scrapers/package.json ./services/scrapers/

# Install dependencies for the whole monorepo
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the web app
# We need to set build-time env vars if they are required for static generation
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build --workspace=apps/web

# --- Runner Stage ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output from builder
# standalone mode copies all necessary files (including node_modules parts)
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

# Next.js standalone server entrypoint
CMD ["node", "apps/web/server.js"]
