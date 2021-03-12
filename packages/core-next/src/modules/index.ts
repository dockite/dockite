import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';

import { startTiming } from '../common/util';

import { createAuthenticationGraphQLModule } from './authentication';
import { createExternalGraphQLModule } from './external';
import { createInternalGraphQLModule } from './internal';

const log = debug('dockite:core:modules');

export interface DockiteGraphQLModules {
  external: GraphQLModule;
  internal: GraphQLModule;
  authentication: GraphQLModule;
}

let modules: DockiteGraphQLModules | null = null;

/**
 * Retrieves the GraphQL modules that Dockite uses. Additionally, caches results for further calls throughout the application.
 */
export const getGraphQLModules = async (invalidate = false): Promise<DockiteGraphQLModules> => {
  if (invalidate) {
    log('invalidating dockite modules');
    modules = null;
  }

  if (modules) {
    return modules;
  }

  const elapased = startTiming();

  const [internalModule, externalModule, authenticationModule] = await Promise.all([
    createInternalGraphQLModule(),
    createExternalGraphQLModule(),
    createAuthenticationGraphQLModule(),
  ]);

  modules = {
    internal: internalModule,
    external: externalModule,
    authentication: authenticationModule,
  };

  log(`dockite modules created in ${elapased()} milliseconds`);

  return modules;
};
