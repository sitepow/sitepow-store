FROM node:current-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --unsafe-perm

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
CMD ["pnpm", "start"]