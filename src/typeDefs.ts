import { gql } from 'apollo-server'

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
    taskDone: Task!
    taskCreated: Task!
    taskDeleted: Task!
  }

  type Query {
    tasks: [Task!]!
  }
`

export default typeDefs
