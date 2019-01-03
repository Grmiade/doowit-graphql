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

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext({ mongoClient }),
  })

  server.listen().then(({ url, subscriptionsUrl }) => {
    console.log(`🚀  Server ready at ${url}`)
    console.log(`🚀  Subscriptions ready at ${subscriptionsUrl}`)
  })
}

runServer()
