FROM node:current-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --ignore-scripts
COPY prisma ./prisma
RUN pnpm exec prisma generate
COPY . .
RUN pnpm build

FROM node:current-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm start"]