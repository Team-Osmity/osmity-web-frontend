# ------------------------------
# 1. Build Stage
# ------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

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

# Next.js standalone 出力をコピー
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./public/_next/static
COPY --from=builder /app/public ./public

# expose（実際のポートは compose で注入）
EXPOSE 3000

CMD ["node", "standalone/server.js"]
