FROM node:13-alpine as build
WORKDIR /usr/node/server
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ./src/ ./src/
COPY tsconfig.json ./
RUN yarn run build

FROM node:13-alpine as dependencies
WORKDIR /usr/node/server
COPY package.json yarn.lock ./
COPY --from=build /usr/local/share/.cache/yarn/ /usr/local/share/.cache/yarn/
RUN yarn install --frozen-lockfile --production

FROM node:13-alpine
WORKDIR /usr/node/server
COPY --from=dependencies /usr/node/server/node_modules/ /usr/node/server/node_modules/
COPY --from=build /usr/node/server/dist/ /usr/node/server/
COPY --from=build /usr/node/server/package.json /usr/node/server/package.json
EXPOSE 4000
CMD node ./index.js
