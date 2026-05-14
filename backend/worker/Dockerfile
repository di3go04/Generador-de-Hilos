# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src/ src/

# Build the worker separately (avoid compiling the full server)
RUN npx tsc --outDir dist

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:22-alpine

# Install FFmpeg + tools
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["node", "dist/worker/process.js"]
