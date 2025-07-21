# Stage 1: installing dependentcies (typescript)
FROM node:24-alpine AS tsdeps

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

# Stage 2: build service
FROM node:24-alpine AS build

WORKDIR /app

COPY . .
COPY --from=tsdeps /app/node_modules node_modules

RUN npm run build

# Stage 3: installing dependentcies (javascript)
FROM node:24-alpine AS jsdeps

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --production

# Stage 4: runtime preparation
FROM node:24-alpine AS runtime

WORKDIR /app

COPY --from=jsdeps /app/node_modules node_modules
COPY --from=build /app/dist dist

EXPOSE 3000

CMD [ "node", "dist/server.js" ]
