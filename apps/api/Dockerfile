FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json eslint.config.mjs ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @vita/api... build

FROM node:22-alpine AS runtime
RUN corepack enable
USER node
WORKDIR /app
COPY --from=build --chown=node:node /app /app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "--filter", "@vita/api", "start"]
