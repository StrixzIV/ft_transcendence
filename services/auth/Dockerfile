# Base image for building
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run generate
RUN npm run db_init
RUN npm run build

# Expose Fastify port
EXPOSE 3000

# Start server
CMD ["sh", "-c", "npm run db_init && node dist/server.js"]
