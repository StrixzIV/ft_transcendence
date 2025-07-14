# Stage 1: installing dependentcies
FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

# Stage 2: build service
FROM node:24-alpine AS build

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules/ node_modules/

RUN npm run build

# Stage 3: runtime preparation
FROM nginx:1.29-alpine-slim AS runtime

COPY --from=build /app/dist/ /var/www/html/
COPY ./nginx /etc/nginx/conf.d/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]