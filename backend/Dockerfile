FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --from=builder /app/dist ./dist

COPY schema.prisma ./schema.prisma
COPY flows ./flows
COPY migrations ./migrations

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/index.js"]