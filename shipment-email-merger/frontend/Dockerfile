FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit && \
    npm cache clean --force
COPY . .
RUN npm run build && \
    rm -rf node_modules/.cache && \
    rm -rf .next/cache

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]