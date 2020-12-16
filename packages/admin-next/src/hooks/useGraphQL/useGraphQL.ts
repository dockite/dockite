import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import {
  ApolloClient,
  ApolloQueryResult,
  MutationOptions,
  OperationVariables,
  QueryOptions,
} from 'apollo-client';
import { ApolloLink, FetchResult } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { reactive } from 'vue';

import { exceptionHandler } from './exceptionHandler';
import { authLink, refreshTokenLink } from './links';

import { useConfig } from '~/hooks/useConfig';

interface UseGraphQLState {
  client: ApolloClient<NormalizedCacheObject> | null;
  loading: boolean;
  operationCount: number;
}

const state: UseGraphQLState = reactive({
  client: null,
  loading: false,
  operationCount: 0,
});

const startExecution = (): void => {
  state.operationCount += 1;
  state.loading = true;
};

const stopExecution = (): void => {
  state.operationCount -= 1;

  if (state.operationCount === 0) {
    state.loading = false;
  }
};

interface UseGraphQLHook {
  executeQuery: <T = any, TVariables = OperationVariables>(
    options: QueryOptions<TVariables>,
  ) => Promise<ApolloQueryResult<T>>;

  executeMutation: <T = any, TVariables = OperationVariables>(
    options: MutationOptions<T, TVariables>,
  ) => Promise<FetchResult<T>>;

  resetCacheStore: () => Promise<void>;

  exceptionHandler: typeof exceptionHandler;

  loading: boolean;
  operationCount: number;
}

export const useGraphQL = (): UseGraphQLHook => {
  const config = useConfig();

  if (!state.client) {
    state.client = new ApolloClient({
      queryDeduplication: true,

      cache: new InMemoryCache(),

      link: ApolloLink.from([
        authLink,
        refreshTokenLink,
        createHttpLink({
          uri: config.app.graphqlEndpoint,
          credentials: 'include',
        }),
      ]),
    });
  }

  const executeQuery = <T = any, TVariables = OperationVariables>(
    options: QueryOptions<TVariables>,
  ): Promise<ApolloQueryResult<T>> => {
    if (!state.client) {
      throw new Error('Attempt to perform GraphQL query without client');
    }

    startExecution();

    return state.client.query(options).finally(() => {
      stopExecution();
    });
  };

  const executeMutation = <T = any, TVariables = OperationVariables>(
    options: MutationOptions<T, TVariables>,
  ): Promise<FetchResult<T>> => {
    if (!state.client) {
      throw new Error('Attempt to perform GraphQL query without client');
    }

    startExecution();

    return state.client.mutate(options).finally(() => {
      stopExecution();
    });
  };

  const resetCacheStore = async (): Promise<void> => {
    if (!state.client) {
      return;
    }

    await state.client.resetStore();
  };

  return {
    executeQuery,
    executeMutation,
    resetCacheStore,
    exceptionHandler,
    loading: state.loading,
    operationCount: state.operationCount,
  };
};

export default useGraphQL;
