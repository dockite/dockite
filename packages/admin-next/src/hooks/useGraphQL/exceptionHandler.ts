import { ApolloError } from '@apollo/client/core';
import { Router } from 'vue-router';

import { ApplicationError, ApplicationErrorCode, ApplicationErrorGroup } from '~/common/errors';

export const exceptionHandler = (err: ApolloError, router?: Router): Error | null => {
  if (err.graphQLErrors) {
    const errors = err.graphQLErrors.map(err => {
      if (err.extensions) {
        if (err.extensions.code === 'FORBIDDEN') {
          return new ApplicationError(
            'You are not authorized to view this content',
            ApplicationErrorCode.NOT_AUTHORIZED,
          );
        }
      }

      return new ApplicationError('An unknown error occurred', ApplicationErrorCode.UNKNOWN_ERROR);
    });

    if (router && errors.some(err => err.code === ApplicationErrorCode.NOT_AUTHORIZED)) {
      router.push('/403');

      return null;
    }

    if (errors.length === 1) {
      return errors[0];
    }

    if (errors.length > 1) {
      return new ApplicationErrorGroup(
        'A number of errors occurred during the GraphQL Request',
        errors,
      );
    }
  }

  if (err.networkError) {
    return new ApplicationError(
      'An error occurred with the network request',
      ApplicationErrorCode.NETWORK_ERROR,
    );
  }

  return null;
};

export default exceptionHandler;
