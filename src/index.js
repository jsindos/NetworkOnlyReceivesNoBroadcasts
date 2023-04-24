import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useMutation, useQuery } from '@apollo/client'

const client = new ApolloClient({
  uri: 'http://localhost:8081/graphql',
  cache: new InMemoryCache({})
})

const ToggleProductIsLiked = gql`
  mutation ToggleProductIsLiked($id: Int, $isLiked: Boolean) {
    toggleProductIsLiked(id: $id, isLiked: $isLiked) {
      id
      isLiked
    }
  }
`

const Products = gql`
  query Products {
    products {
      id
      isLiked
    }
  }
`

/**
 * This re-creates the problem seen in pop-f, where the result of a mutation is not being broadcast to a different query in the application, which contains the same underlying data.
 *
 * There are two solutions on "@apollo/client": "^3.7.12":
 *   1. Turn off `fetchPolicy: 'network-only'`
 *   2. Removing `optimisticResponse`
 */
const App = () => {
  const { data: { products } = { products: [] } } = useQuery(Products, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: 'notifyOnNetworkStatusChange'
  })

  const [toggleProductIsLikedMutation] = useMutation(ToggleProductIsLiked)

  const toggleIsLiked = async (id, isLiked) => {
    await toggleProductIsLikedMutation({
      variables: {
        id,
        isLiked
      },
      optimisticResponse: {
        toggleProductIsLiked: {
          __typename: 'Product',
          id,
          isLiked: !isLiked
        }
      }
    })
  }

  return (
    <>
      <h3>
        products in cache
      </h3>
      {
        products.map((p, i) => (
          <div key={i}>
            <div>{p.id}, {String(p.isLiked)}</div>
            <div style={{ border: '1px solid #222', cursor: 'pointer', padding: '10px' }} onClick={() => toggleIsLiked(p.id, p.isLiked)}>
              toggle `isLiked`
            </div>
          </div>
        ))
      }
    </>
  )
}

const wrapper = document.getElementById('root')

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  wrapper
)
