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
      const result = await context.db.collection('tasks').insertOne({
        _id: new ObjectId(),
        message: args.message,
        done: false,
      })

      const newTask = result.ops[0]
      pubsub.publish(TASK_CREATED, { taskCreated: newTask })
      return newTask
    },

    async deleteTask(_parent, args: { id: string }, context: Context) {
      const result = await context.db
        .collection('tasks')
        .findOneAndDelete({ _id: new ObjectId(args.id) })

      const deletedTask = result.value
      pubsub.publish(TASK_DELETED, { taskDeleted: deletedTask })
      return deletedTask
    },

    async updateTask(_parent, args: { id: string; done: boolean }, context: Context) {
      const taskId = new ObjectId(args.id)
      const task = await context.db.collection('tasks').findOne({ _id: taskId })
      if (!task) throw new ApolloError('No task found')

      const update = { done: args.done }
      await context.db.collection('tasks').update({ _id: taskId }, { $set: update })

      const updatedTask = { ...task, ...update }
      pubsub.publish(TASK_DONE, { taskDone: updatedTask })
      return updatedTask
    },
  },

  Subscription: {
    taskCreated: {
      subscribe: () => pubsub.asyncIterator(TASK_CREATED),
    },
    taskDone: {
      subscribe: () => pubsub.asyncIterator(TASK_DONE),
    },
    taskDeleted: {
      subscribe: () => pubsub.asyncIterator(TASK_DELETED),
    },
  },

  Query: {
    tasks(_parent, _args: {}, context: Context) {
      return context.db
        .collection('tasks')
        .find()
        .toArray()
    },
  },
}
