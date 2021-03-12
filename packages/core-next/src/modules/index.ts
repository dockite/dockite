import { GraphQLModule } from '@graphql-modules/core';

import { createAuthenticationGraphQLModule } from './authentication';
import { createExternalGraphQLModule } from './external';
import { createInternalGraphQLModule } from './internal';

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
    modules = null;
  }

  if (modules) {
    return modules;
  }

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

  return modules;
};
