FROM node:lts-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --no-frozen-lockfile --ignore-scripts

COPY . .

ARG BETTER_AUTH_SECRET=build-default-secret-key-32-chars-long
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=https://sitepow.store
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dummy?schema=public"
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm exec prisma generate && \
    pnpm build

FROM node:lts-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]