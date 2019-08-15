import { MongoClient } from 'mongodb';

import TaskAPI from './datasources/task';

interface DatasourcesOptions {
  mongoClient: MongoClient;
}

export function createDatasources(options: DatasourcesOptions) {
  return {
    taskAPI: new TaskAPI({ mongoClient: options.mongoClient }),
  };
}

export interface Context {
  dataSources: ReturnType<typeof createDatasources>;
}
