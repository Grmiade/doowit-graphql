import { ApolloServer } from 'apollo-server'
import { MongoClient } from 'mongodb'

import { createContext } from './context'
import typeDefs from './typeDefs'
import resolvers from './resolvers'

async function runServer() {
  if (!process.env.MONGO_HOST) throw new Error('MONGO_HOST env is missing')

  const mongoClient = await MongoClient.connect(
    process.env.MONGO_HOST,
    { useNewUrlParser: true },
  )

  await mongoClient.connect()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext({ mongoClient }),
  })

  return server.listen()
}

runServer().then(serverInfo => {
  console.log(`🚀  Server ready at ${serverInfo.url}`)
  console.log(`🚀  Subscriptions ready at ${serverInfo.subscriptionsUrl}`)
})
