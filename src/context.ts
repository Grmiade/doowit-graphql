import { PrismaClient } from '@prisma/client';

import TaskAPI from './datasources/task';

interface DatasourcesOptions {
  prisma: PrismaClient;
}

export function createDatasources(options: DatasourcesOptions) {
  return {
    taskAPI: new TaskAPI({ prisma: options.prisma }),
  };
}

export interface Context {
  dataSources: ReturnType<typeof createDatasources>;
}
