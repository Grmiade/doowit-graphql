import { ApolloServer } from 'apollo-server';
import { MongoClient } from 'mongodb';

import { createContext } from './context';
import typeDefs from './typeDefs';
import resolvers from './resolvers';

(async () => {
  if (!process.env.MONGO_HOST) throw new Error('MONGO_HOST env is missing');
  const mongoClient = await MongoClient.connect(process.env.MONGO_HOST, { useNewUrlParser: true });

  const server = new ApolloServer({
    context: createContext({ mongoClient }),
    resolvers,
    typeDefs,
  });

  const serverInfo = await server.listen();
  console.log(`🚀  Server ready at ${serverInfo.url}`);
  console.log(`🚀  Subscriptions ready at ${serverInfo.subscriptionsUrl}`);
})();
