import { MongoClient, ObjectId } from 'mongodb'

export interface Document {
  _id: ObjectId
}

export interface TaskDocument extends Document {
  done: boolean
  message: string
}

export default class MongoConnector {
  private client: MongoClient
  private databaseName: string

  constructor(client: MongoClient, databaseName: string) {
    this.client = client
    this.databaseName = databaseName
  }

  public collection<Model>(name: string) {
    return this.client.db(this.databaseName).collection<Model>(name)
  }
}
