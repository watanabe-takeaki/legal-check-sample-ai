FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Prisma Client生成
RUN npx prisma generate

EXPOSE 8080

# 起動時にDB同期してからdev serverを起動
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run dev"]
