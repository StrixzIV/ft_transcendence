# Stage 1: installing dependentcies
FROM node:24-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Stage 2: build service
FROM node:24-alpine AS build

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules node_modules

RUN npm install

RUN npm run generate
RUN npm run build

# Stage 3: runtime preparation
FROM node:24-alpine AS runtime

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/package*.json .
COPY --from=build /app/dist dist
COPY --from=build /app/prisma prisma

EXPOSE 3000

CMD ["sh", "-c", "npm run db_init && node dist/server.js"]
