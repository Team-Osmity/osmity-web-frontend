FROM node:20-alpine AS builder
WORKDIR /app

ARG APP_ENV
ARG FRONT_VERSION
ARG FRONT_BUILD_TIME
ARG FRONT_COMMIT_SHA

ENV NEXT_PUBLIC_APP_ENV=${APP_ENV}
ENV NEXT_PUBLIC_APP_VERSION=${FRONT_VERSION}
ENV NEXT_PUBLIC_BUILD_TIME=${FRONT_BUILD_TIME}
ENV NEXT_PUBLIC_COMMIT_SHA=${FRONT_COMMIT_SHA}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
