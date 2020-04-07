import { gql } from 'apollo-server';

const typeDefs = gql`
  type Task {
    id: ID!
    message: String!
    done: Boolean!
  }

  type Mutation {
    createTask(message: String!): Task!
    updateTask(id: ID!, done: Boolean!): Task!
    deleteTask(id: ID!): Task!
  }

  type Subscription {
    taskUpdated(done: Boolean): Task!
    taskCreated: Task!
    taskDeleted: Task!
  }

  type Query {
    task(id: ID!): Task
    tasks(limit: Int = 20, offset: Int): [Task!]!
  }
`;

export default typeDefs;
