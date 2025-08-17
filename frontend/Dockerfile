# Stage 1: installing dependentcies
FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

# Stage 2: build service
FROM node:24-alpine AS build

WORKDIR /app

ARG DOMAIN_NAME
ENV VITE_DOMAIN_NAME=${DOMAIN_NAME}

COPY . .
COPY --from=deps /app/node_modules/ node_modules/

RUN npm run build

# Stage 3: runtime preparation
FROM nginx:1.29-alpine-slim AS runtime

COPY --from=build /app/dist/ /var/www/html/
COPY ./nginx/templates /etc/nginx/templates

EXPOSE 8080
