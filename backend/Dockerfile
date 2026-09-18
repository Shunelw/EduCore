FROM node:22-slim AS build
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm config set fetch-timeout 600000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci
COPY . .
# prisma.config.ts requires DATABASE_URL to exist just to load config;
# `generate` never actually connects, so a placeholder is fine here.
ENV DATABASE_URL="mysql://user:pass@localhost:3306/db"
RUN npx prisma generate
RUN npm run build

FROM node:22-slim AS runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm config set fetch-timeout 600000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY prisma.config.ts ./

EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && node dist/bootstrap.js && node dist/server.js"]
