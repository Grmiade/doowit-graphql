import { gql } from 'apollo-server'

const typeDefs = gql`
  scalar DateTime

  type Task {
    id: ID!
    message: String!
    done: Boolean!
    updatedAt: DateTime!
  }

  type Mutation {
    createTask(message: String!): Task!
    toggleTask(id: ID!): Task!
    deleteTask(id: ID!): Task!
  }

  type Subscription {
    taskDone: Task!
    taskCreated: Task!
    taskDeleted: Task!
  }

  type Query {
    tasks: [Task!]!
  }
`

export default typeDefs
