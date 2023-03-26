###
# Client
###
FROM node:18-alpine AS client

WORKDIR /app

COPY client/package*.json ./
RUN npm install

COPY client/tsconfig.json ./
COPY client/public ./public
COPY client/src ./src
COPY client/.env* ./

RUN npm run build

###
# API Deps
###
FROM node:18-alpine AS api-deps

RUN apk update
RUN apk add docker

###
# API Build
###
FROM api-deps AS api-builder

WORKDIR /app

COPY api/package*.json ./
RUN npm install

COPY api/tsconfig.json ./
COPY api/src ./src
RUN npm run build

###
# App
###
FROM api-deps AS app

WORKDIR /app/api

COPY --chown=node:www api/package*.json .
RUN npm install --production
COPY --from=api-builder --chown=node:www /app/build ./build

WORKDIR /app/client
COPY --from=client --chown=node:www /app/build ./build

WORKDIR /app

USER node
CMD ["node", "api/build/index.js"]
