FROM node:18-alpine AS deps

RUN apk update
RUN apk add docker

FROM deps AS builder

WORKDIR /build

COPY package.json .
RUN npm install

COPY src ./src/
RUN npm build

FROM deps AS app

WORKDIR /app
COPY --from=builder /build/package.json package.json
COPY --from=builder /build/node_modules node_modules
COPY --from=builder /build/build build
COPY proxy.js proxy.js

EXPOSE 3000

CMD ["npm", "start"]
