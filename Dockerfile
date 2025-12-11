# ------------------------------
# 1. Build Stage
# ------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# package.json と lock ファイルだけ先にコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# プロジェクト全体をコピー
COPY . .

# 本番ビルド
RUN npm run build

# ------------------------------
# 2. Run Stage（本番ランタイム）
# ------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# standalone モードの build 出力をコピー
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./public/static
COPY --from=builder /app/public ./public

# ポートを指定
EXPOSE 3000

# 起動コマンド
CMD ["node", "standalone/server.js"]
