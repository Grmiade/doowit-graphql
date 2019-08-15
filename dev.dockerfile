FROM node:12-alpine

WORKDIR /usr/node/server

COPY package.json yarn.lock ./
RUN yarn install

COPY nodemon.json tsconfig.json ./
COPY ./src ./src

ENV NODE_ENV development
EXPOSE 4000

CMD yarn run nodemon --inspect=0.0.0.0 ./src/index.ts
