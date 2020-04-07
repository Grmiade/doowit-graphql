import { PrismaClient } from '@prisma/client';
import { ApolloServer } from 'apollo-server';

import { createDatasources } from './context';
import resolvers from './resolvers';
import typeDefs from './typeDefs';

const prisma = new PrismaClient();

const server = new ApolloServer({
  dataSources: () => createDatasources({ prisma }),
  resolvers,
  typeDefs,
});

const serverInfo = await server.listen();
console.log(`🚀  Server ready at ${serverInfo.url}`);
console.log(`🚀  Subscriptions ready at ${serverInfo.subscriptionsUrl}`);
