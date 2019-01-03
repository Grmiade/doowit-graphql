import { PubSub, ApolloError } from 'apollo-server'
import { ObjectId } from 'mongodb'

import { TaskDocument } from 'connectors/mongo'
import { Context } from 'context'

const pubsub = new PubSub()
const TASK_CREATED = 'TASK_CREATED'
const TASK_DONE = 'TASK_DONE'
const TASK_DELETED = 'TASK_DELETED'

export default {
  Task: {
    id: (parent: TaskDocument) => parent._id.toHexString(),
  },

  Mutation: {
    async createTask(_parent, args: { message: string }, context: Context) {
      const result = await context.db
        .collection<TaskDocument>('tasks')
        .insertOne({ _id: new ObjectId(), message: args.message, done: false })
      pubsub.publish(TASK_CREATED, { taskCreated: result.ops[0] })
      return result.ops[0]
    },

    async deleteTask(_parent, args: { id: string }, context: Context) {
      const result = await context.db
        .collection<TaskDocument>('tasks')
        .findOneAndDelete({ _id: new ObjectId(args.id) })
      pubsub.publish(TASK_DELETED, { taskDeleted: result.value })
      return result.value
    },

    async toggleTask(_parent, args: { id: string }, context: Context) {
      const task = await context.db
        .collection<TaskDocument>('tasks')
        .findOne({ _id: new ObjectId(args.id) })
      if (!task) throw new ApolloError('No task found')

      const result = await context.db
        .collection<TaskDocument>('tasks')
        .findOneAndUpdate(
          { _id: new ObjectId(args.id) },
          { $set: { done: !task.done } },
          { returnOriginal: false },
        )
      pubsub.publish(TASK_DONE, { taskDone: result.value })
      return result.value
    },
  },

  Subscription: {
    taskCreated: {
      subscribe: () => pubsub.asyncIterator([TASK_CREATED]),
    },
    taskDone: {
      subscribe: () => pubsub.asyncIterator([TASK_DONE]),
    },
    taskDeleted: {
      subscribe: () => pubsub.asyncIterator([TASK_DELETED]),
    },
  },

  Query: {
    tasks(_parent, _args, context: Context) {
      return context.db
        .collection<TaskDocument>('tasks')
        .find({})
        .toArray()
    },
  },
}
