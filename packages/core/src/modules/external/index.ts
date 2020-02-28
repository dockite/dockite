import { GraphQLModule } from '@graphql-modules/core';

import { getModules } from '../../utils';

// eslint-disable-next-line
export const getRegisteredExternalModules = (): any[] => {
  return getModules('external');
};

export const ExternalGraphQLModule = new GraphQLModule();
