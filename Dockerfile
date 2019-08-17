FROM node:12-alpine as builder
WORKDIR /usr/node/server

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY ./src/ ./src/
COPY tsconfig.json ./
RUN yarn run build


FROM node:12-alpine as dependencies
WORKDIR /usr/node/server

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production


FROM node:12-alpine
WORKDIR /usr/node/server
COPY --from=dependencies /usr/node/server/node_modules/ /usr/node/server/node_modules/
COPY --from=builder /usr/node/server/dist/ /usr/node/server/
EXPOSE 4000
CMD node ./index.js
