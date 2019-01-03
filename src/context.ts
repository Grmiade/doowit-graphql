import { MongoClient } from 'mongodb'

import MongoConnector from './connectors/mongo'

interface ContextOptions {
  mongoClient: MongoClient
}

export function createContext(options: ContextOptions) {
  const db = new MongoConnector(options.mongoClient)
  return { db }
}

export type Context = ReturnType<typeof createContext>
