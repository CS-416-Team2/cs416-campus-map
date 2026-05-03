# ============================================================
# Stage 1 — Install dependencies
# ============================================================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root package.json (it delegates to frontend/course_map)
COPY package.json ./

# Copy the actual Next.js app package files
COPY frontend/course_map/package.json frontend/course_map/package-lock.json ./frontend/course_map/

# Install all dependencies (root postinstall triggers frontend install)
RUN npm install

# ============================================================
# Stage 2 — Build the Next.js application
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/course_map/node_modules ./frontend/course_map/node_modules

# Copy all source code
COPY . .

# Build arguments for environment variables needed at build time
# (NEXT_PUBLIC_* vars are inlined during build)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MAPBOX_TOKEN

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN

# Build the application (uses standalone output mode)
RUN npm run build

# ============================================================
# Stage 3 — Production runner (minimal image)
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone build output
COPY --from=builder /app/frontend/course_map/.next/standalone ./
COPY --from=builder /app/frontend/course_map/.next/static ./frontend/course_map/.next/static
COPY --from=builder /app/frontend/course_map/public ./frontend/course_map/public

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# The standalone output creates a server.js in the app directory
CMD ["node", "frontend/course_map/server.js"]
