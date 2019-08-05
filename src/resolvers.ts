import { PubSub, ApolloError } from 'apollo-server';
import { ObjectId } from 'mongodb';

import { TaskDocument } from 'connectors/mongo';
import { Context } from 'context';

const pubsub = new PubSub();
const TASK_CREATED = 'TASK_CREATED';
const TASK_UPDATED = 'TASK_UPDATED';
const TASK_DELETED = 'TASK_DELETED';

export default {
  Task: {
    id: (parent: TaskDocument) => parent._id.toHexString(),
  },

  Mutation: {
    async createTask(_parent: null, args: { message: string }, context: Context) {
      const result = await context.db.collection('tasks').insertOne({
        _id: new ObjectId(),
        message: args.message,
        done: false,
      });

      const newTask = result.ops[0];
      pubsub.publish(TASK_CREATED, { taskCreated: newTask });
      return newTask;
    },

    async deleteTask(_parent: null, args: { id: string }, context: Context) {
      const result = await context.db
        .collection('tasks')
        .findOneAndDelete({ _id: new ObjectId(args.id) });

      const deletedTask = result.value;
      pubsub.publish(TASK_DELETED, { taskDeleted: deletedTask });
      return deletedTask;
    },

    async updateTask(_parent: null, args: { id: string; done: boolean }, context: Context) {
      const taskId = new ObjectId(args.id);
      const task = await context.db.collection('tasks').findOne({ _id: taskId });
      if (!task) throw new ApolloError('No task found');

      const update = { done: args.done };
      await context.db.collection('tasks').updateOne({ _id: taskId }, { $set: update });

      const updatedTask = { ...task, ...update };
      pubsub.publish(TASK_UPDATED, { taskUpdated: updatedTask });
      return updatedTask;
    },
  },

  Subscription: {
    taskCreated: {
      subscribe: () => pubsub.asyncIterator(TASK_CREATED),
    },
    taskUpdated: {
      subscribe: () => pubsub.asyncIterator(TASK_UPDATED),
    },
    taskDeleted: {
      subscribe: () => pubsub.asyncIterator(TASK_DELETED),
    },
  },

  Query: {
    tasks(_parent: null, _args: {}, context: Context) {
      return context.db
        .collection('tasks')
        .find()
        .toArray();
    },
  },
};
