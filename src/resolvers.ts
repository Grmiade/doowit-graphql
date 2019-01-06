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
        version: 1,
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

    async completeTask(_parent, args: { id: string }, context: Context) {
      const taskCollection = context.db.collection('tasks')

      const task = await taskCollection.findOne<Pick<TaskDocument, '_id' | 'version'>>(
        { _id: new ObjectId(args.id) },
        { projection: { version: true } },
      )
      if (!task) throw new ApolloError('No task found')

      const update = { done: true, version: task.version + 1 }
      await taskCollection.updateOne({ _id: task._id }, { $set: update })

      const updatedTask = { ...task, ...update }
      pubsub.publish(TASK_DONE, { taskDone: updatedTask })
      return updatedTask
    },

    async uncompleteTask(_parent, args: { id: string }, context: Context) {
      const taskCollection = context.db.collection('tasks')

      const task = await taskCollection.findOne<Pick<TaskDocument, '_id' | 'version'>>(
        { _id: new ObjectId(args.id) },
        { projection: { version: true } },
      )
      if (!task) throw new ApolloError('No task found')

      const update = { done: false, version: task.version + 1 }
      await taskCollection.updateOne({ _id: task._id }, { $set: update })

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
    tasks(_parent, _args, context: Context) {
      return context.db
        .collection('tasks')
        .find()
        .toArray()
    },
  },
}
