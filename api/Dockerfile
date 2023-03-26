FROM node:18-alpine AS deps

RUN apk update
RUN apk add docker

FROM deps AS builder

WORKDIR /build

COPY package*.json .
RUN npm install
RUN npm build

FROM deps AS app

WORKDIR /app
COPY --from=builder /build/build .

EXPOSE 3000

CMD ["node", "index.js"]
