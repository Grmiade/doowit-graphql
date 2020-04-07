import { PrismaClient, Task } from '@prisma/client';
import { DataSource } from 'apollo-datasource';
import DataLoader from 'dataloader';

interface Options {
  prisma: PrismaClient;
}

interface FindParams {
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

class TaskAPI extends DataSource {
  prisma: PrismaClient;

  constructor(options: Options) {
    super();
    this.prisma = options.prisma;
  }

  private loader = new DataLoader(async (ids: string[]) => {
    console.log(ids);
    const tasks = await this.prisma.task.findMany({ where: { id: { in: ids } } });

    let tasksById: Record<string, Task> = {};
    for await (const task of tasks) {
      tasksById = { ...tasksById, [task.id]: task };
    }

    return ids.map<Task | null>((id) => tasksById[id] || null);
  });

  findById(id: string) {
    return this.loader.load(id);
  }

  findByIds(ids: string[]) {
    return this.loader.loadMany(ids);
  }

  async find(params: FindParams = {}, options: FindOptions = {}) {
    const tasks = await this.prisma.task.findMany({
      where: params,
      first: options.limit,
      skip: options.offset,
      select: { id: true }, // TODO Est-ce vraiment une bonne idee ?
    });
    const ids = tasks.map((task) => task.id);
    return this.loader.loadMany(ids);
  }

  count(params: CountParams = {}) {
    return this.prisma.task.count({ where: params });
  }

  async create(params: CreateParams) {
    const task = await this.prisma.task.create({ data: params });
    this.loader.prime(task.id, task);
    return task;
  }

  async delete(id: string) {
    const task = await this.prisma.task.delete({ where: { id } });
    this.loader.prime(id, null);
    return task;
  }

  async update(id: string, params: UpdateParams) {
    const task = await this.prisma.task.update({ where: { id }, data: params });
    this.loader.clear(id).prime(id, task);
    return task;
  }
}

export default TaskAPI;
