import { DataSource } from 'apollo-datasource';
import { ApolloError } from 'apollo-server';
import DataLoader from 'dataloader';
import { isUndefined, omitBy } from 'lodash';
import { MongoClient, ObjectId, Collection } from 'mongodb';

interface Options {
  mongoClient: MongoClient;
}

interface TaskDocument {
  _id: ObjectId;
  done: boolean;
  message: string;
}

interface Task {
  id: string;
  done: boolean;
  message: string;
}

interface FindParams {
  ids?: string[];
  done?: boolean;
}

interface FindOptions {
  limit?: number;
  offset?: number;
}

interface CountParams {
  done?: boolean;
}

interface CreateParams {
  message: string;
}

interface UpdateParams {
  done: boolean;
}

function formatTaskDocument(document: TaskDocument): Task {
  return {
    done: document.done,
    id: document._id.toHexString(),
    message: document.message,
  };
}

class TaskAPI extends DataSource {
  collection: Collection<TaskDocument>;

  constructor(options: Options) {
    super();
    this.collection = options.mongoClient.db().collection<TaskDocument>('tasks');
  }

  private loader = new DataLoader(async (ids: string[]) => {
    const tasks = this.getConnection({ ids });

    let tasksById: Record<string, Task> = {};
    for await (const task of tasks) {
      tasksById = { ...tasksById, [task.id]: task };
    }

    return ids.map<Task | null>(id => tasksById[id] || null);
  });

  private getConnection(params: FindParams = {}, options: FindOptions = {}) {
    const query = {
      _id: params.ids && { $in: params.ids.map(id => new ObjectId(id)) },
      count: params.done,
    };

    const cursor = this.collection.find(omitBy(query, isUndefined)).map(formatTaskDocument);

    if (options.limit) cursor.limit(options.limit);
    if (options.offset) cursor.skip(options.offset);

    return cursor;
  }

  findById(id: string) {
    return this.loader.load(id);
  }

  find(params: FindParams = {}, options: FindOptions = {}) {
    return this.getConnection(params, options).toArray();
  }

  count(params: CountParams = {}) {
    const query = { count: params.done };
    return this.collection.countDocuments(omitBy(query, isUndefined));
  }

  async create(params: CreateParams) {
    const { insertedId, ops } = await this.collection.insertOne({
      message: params.message,
      done: false,
    });

    const task = formatTaskDocument(ops[0]);
    this.loader.prime(insertedId.toHexString(), task);
    return task;
  }

  async delete(id: string) {
    const { value } = await this.collection.findOneAndDelete({ _id: new ObjectId(id) });
    if (!value) throw new ApolloError('Task not found');
    this.loader.prime(id, null);
    return formatTaskDocument(value);
  }

  async update(id: string, params: UpdateParams) {
    const { value } = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { done: params.done } },
      { returnOriginal: false },
    );
    if (!value) throw new ApolloError('Task not found');

    const task = formatTaskDocument(value);
    this.loader.prime(id, task);
    return task;
  }
}

export default TaskAPI;
