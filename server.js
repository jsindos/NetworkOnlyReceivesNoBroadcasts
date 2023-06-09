const express = require('express')
const app = express()
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')

const port = process.env.PORT || 8081
const hostname = '0.0.0.0'

const typeDefs = [`
  type Query {
    products: [Product]
  }

  type Product {
    id: Int
    isLiked: Boolean
  }

  type Mutation {
    toggleProductIsLiked(id: Int, isLiked: Boolean): Product
  }
`]

let id = 1

const resolvers = {
  Query: {
    products () {
      const products = [{ id, isLiked: false }]
      id++
      return products
    }
  },
  Mutation: {
    toggleProductIsLiked (root, args) {
      const { id, isLiked } = args
      return { id, isLiked: !isLiked }
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const origin = function (origin, callback) {
  return callback(null, true)
}

async function serve () {
  const server = new ApolloServer({
    schema,
    formatError: (e) => {
      console.error(JSON.stringify(e, null, 2))
      return e
    }
  })

  await server.start()

  // https://stackoverflow.com/questions/54485239/apollo-server-express-cors-issue
  server.applyMiddleware({
    app,
    cors: { credentials: true, origin }
  })

  await new Promise(resolve => app.listen(port, hostname, resolve))
  console.log(`Server running at http://${hostname}:${port}/`)
  console.log(`graphql running at http://${hostname}:${port}${server.graphqlPath}`)
}

serve()
