###
# Shared
###
FROM node:18-alpine AS shared

WORKDIR /shared

COPY shared ./

###
# Client
###
FROM shared AS client

WORKDIR /app

COPY client/package*.json ./
RUN npm install

COPY client/tsconfig.json ./
COPY client/vite.config.ts ./
COPY client/public ./public
COPY client/src ./src
COPY client/index.html ./
COPY client/.env* ./

RUN npm run build

###
# API Deps
###
FROM shared AS api-deps

# dockerode doesn't require these?
# RUN apk update
# RUN apk add docker

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
RUN npm install --omit=dev
COPY --from=api-builder --chown=node:www /app/build ./build

WORKDIR /app/client
COPY --from=client --chown=node:www /app/build ./build

WORKDIR /app

# USER node # must be root to interact with docker
ENV CLIENT_DIR "../../../../client/build"
CMD ["node", "api/build/app/src/index.js"]
