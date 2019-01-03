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

  constructor(client: MongoClient) {
    this.client = client
  }

  public collection<Model>(name: string) {
    return this.client.db().collection<Model>(name)
  }
}
