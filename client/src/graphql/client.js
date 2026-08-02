import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { fromPromise } from '@apollo/client/link/utils';

const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}/graphql`
    : 'http://localhost:5000/graphql');

const httpLink = new HttpLink({ uri: GRAPHQL_URL });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('handlr_access_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Raw fetch-based refresh (kept outside Apollo to avoid link-order recursion issues)
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('handlr_refresh_token');
  if (!refreshToken) throw new Error('No refresh token available.');

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation RefreshToken($token: String!) {
          refreshToken(token: $token) {
            accessToken
            refreshToken
            user { id name email role isVerified profilePicture }
          }
        }
      `,
      variables: { token: refreshToken },
    }),
  });

  const { data, errors } = await res.json();
  if (errors?.length || !data?.refreshToken) {
    throw new Error(errors?.[0]?.message || 'Refresh failed.');
  }

  const { accessToken, refreshToken: newRefreshToken, user } = data.refreshToken;
  localStorage.setItem('handlr_access_token', accessToken);
  localStorage.setItem('handlr_refresh_token', newRefreshToken);
  localStorage.setItem('handlr_user', JSON.stringify(user));
  return accessToken;
};

const clearSession = () => {
  localStorage.removeItem('handlr_access_token');
  localStorage.removeItem('handlr_refresh_token');
  localStorage.removeItem('handlr_user');
  // Full reload so React state / route guards reset cleanly.
  if (typeof window !== 'undefined') window.location.href = '/login';
};

// On UNAUTHENTICATED, try a silent refresh once, then retry the failed operation.
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  const authError = graphQLErrors?.find(
    (e) => e.extensions?.code === 'UNAUTHENTICATED'
  );

  if (!authError) return;
  // Never try to refresh using a request that IS the refresh/login/register call.
  if (['RefreshToken', 'Login', 'Register'].includes(operation.operationName)) {
    clearSession();
    return;
  }

  return fromPromise(
    refreshAccessToken()
      .then((newAccessToken) => {
        operation.setContext(({ headers = {} }) => ({
          headers: { ...headers, authorization: `Bearer ${newAccessToken}` },
        }));
      })
      .catch(() => {
        clearSession();
      })
  ).flatMap(() => forward(operation));
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});