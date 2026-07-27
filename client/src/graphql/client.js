import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:5000/graphql';

const httpLink = new HttpLink({ uri: GRAPHQL_URL });

// Attach the access token to every request
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('handlr_access_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Basic error link; Phase 2 will extend this to auto-refresh on UNAUTHENTICATED
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`[GraphQL error]: ${message}`, extensions?.code);
    });
  }
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
