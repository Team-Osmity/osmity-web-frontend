# ------------------------------
# 1. Build Stage
# ------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_APP_ENV
ARG API_BASE_URL

ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}
ENV API_BASE_URL=${API_BASE_URL}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ------------------------------
# 2. Run Stage
# ------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./public/_next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "standalone/server.js"]
