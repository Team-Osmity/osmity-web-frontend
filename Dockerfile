FROM node:20-alpine AS builder
WORKDIR /app

ARG APP_ENV
ARG APP_VERSION
ARG BUILD_TIME
ARG GIT_COMMIT

ENV NEXT_PUBLIC_APP_ENV=${APP_ENV}
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}
ENV NEXT_PUBLIC_BUILD_TIME=${BUILD_TIME}
ENV NEXT_PUBLIC_GIT_COMMIT=${GIT_COMMIT}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./public/_next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "standalone/server.js"]
