import { Task } from '@prisma/client';
import { withFilter } from 'apollo-server';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

import { Context } from './context';

const pubsub = new RedisPubSub({
  publisher: new Redis({ host: process.env.REDIS_HOST }),
  subscriber: new Redis({ host: process.env.REDIS_HOST }),
});
const TASK_CREATED = 'TASK_CREATED';
const TASK_UPDATED = 'TASK_UPDATED';
const TASK_DELETED = 'TASK_DELETED';

interface TaskCreatedPayload {
  taskCreated: Task;
}

interface TaskUpdatedPayload {
  taskUpdated: Task;
}

interface TaskDeletedPayload {
  taskDeleted: Task;
}

interface SubscriptionFilterArgs {
  done: boolean;
}

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

interface TaskArgs {
  id: string;
}

interface TasksArgs {
  limit?: number;
  offset?: number;
}

export default {
  Mutation: {
    async createTask(_parent: null, args: CreateTaskArgs, context: Context) {
      const task = await context.dataSources.taskAPI.create({ message: args.message });
      pubsub.publish<TaskCreatedPayload>(TASK_CREATED, { taskCreated: task });
      return task;
    },

    async deleteTask(_parent: null, args: DeleteTaskArgs, context: Context) {
      const task = await context.dataSources.taskAPI.delete(args.id);
      pubsub.publish<TaskDeletedPayload>(TASK_DELETED, { taskDeleted: task });
      return task;
    },

    async updateTask(_parent: null, args: UpdateTaskArgs, context: Context) {
      const task = await context.dataSources.taskAPI.update(args.id, { done: args.done });
      pubsub.publish<TaskUpdatedPayload>(TASK_UPDATED, { taskUpdated: task });
      return task;
    },
  },

  Subscription: {
    taskCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(TASK_CREATED),
        (parent: TaskCreatedPayload, args: SubscriptionFilterArgs) => {
          return parent.taskCreated.done === args.done;
        },
      ),
    },

    taskUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(TASK_UPDATED),
        (parent: TaskUpdatedPayload, args: SubscriptionFilterArgs) => {
          return parent.taskUpdated.done === args.done;
        },
      ),
    },

    taskDeleted: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(TASK_DELETED),
        (parent: TaskDeletedPayload, args: SubscriptionFilterArgs) => {
          return parent.taskDeleted.done === args.done;
        },
      ),
    },
  },

  Query: {
    task(_parent: null, args: TaskArgs, context: Context) {
      return context.dataSources.taskAPI.findById(args.id);
    },

    tasks(_parent: null, args: TasksArgs, context: Context) {
      return context.dataSources.taskAPI.find({}, { limit: args.limit, offset: args.offset });
    },
  },
};
