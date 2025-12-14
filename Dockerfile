FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_COMMIT_SHA

ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_COMMIT_SHA=$NEXT_PUBLIC_COMMIT_SHA

COPY package*.json ./
RUN npm install
COPY . .

# ★ 一時的に強制差分を作る
RUN echo "BUILD FROM CI $(date)" > BUILD_MARK.txt

RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./public/_next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/BUILD_MARK.txt ./BUILD_MARK.txt

EXPOSE 3000
CMD ["node", "standalone/server.js"]
