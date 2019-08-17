import { PubSub } from 'apollo-server';

import { Context } from './context';

const pubsub = new PubSub();
const TASK_CREATED = 'TASK_CREATED';
const TASK_UPDATED = 'TASK_UPDATED';
const TASK_DELETED = 'TASK_DELETED';

interface CreateTaskArgs {
  message: string;
}

interface DeleteTaskArgs {
  id: string;
}

interface UpdateTaskArgs {
  id: string;
  done: boolean;
}

export default {
  Mutation: {
    async createTask(_parent: null, args: CreateTaskArgs, context: Context) {
      const task = await context.dataSources.taskAPI.create({ message: args.message });
      pubsub.publish(TASK_CREATED, { taskCreated: task });
      return task;
    },

    async deleteTask(_parent: null, args: DeleteTaskArgs, context: Context) {
      const task = await context.dataSources.taskAPI.delete(args.id);
      pubsub.publish(TASK_DELETED, { taskDeleted: task });
      return task;
    },

    async updateTask(_parent: null, args: UpdateTaskArgs, context: Context) {
      const task = await context.dataSources.taskAPI.update(args.id, { done: args.done });
      pubsub.publish(TASK_UPDATED, { taskUpdated: task });
      return task;
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
      return context.dataSources.taskAPI.find();
    },
  },
};
