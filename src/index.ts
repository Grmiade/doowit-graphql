import { ApolloServer } from 'apollo-server';
import { MongoClient } from 'mongodb';

import { createDatasources } from './context';
import resolvers from './resolvers';
import typeDefs from './typeDefs';

(async () => {
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL env is missing');
  const mongoClient = await MongoClient.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    appname: `${process.env.npm_package_name}@${process.env.npm_package_version}`,
  });

  const server = new ApolloServer({
    dataSources: () => createDatasources({ mongoClient }),
    resolvers,
    typeDefs,
  });

  const serverInfo = await server.listen();
  console.log(`🚀  Server ready at ${serverInfo.url}`);
  console.log(`🚀  Subscriptions ready at ${serverInfo.subscriptionsUrl}`);
})();
