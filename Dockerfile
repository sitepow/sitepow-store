FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm exec prisma generate && \
    pnpm build && \
    pnpm prune --prod && \
    rm -rf /root/.local/share/pnpm/store

FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["bun", "run", "start"]