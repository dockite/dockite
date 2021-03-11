import { Module } from 'graphql-modules';

import { createInternalGraphQLModule } from './internal';

export interface DockiteGraphQLModules {
  external: Module;
  internal: Module;
  authentication: Module;
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

  const [internalModule] = await Promise.all([createInternalGraphQLModule()]);

  modules = {
    internal: internalModule,
    external: internalModule,
    authentication: internalModule,
  };

  return modules;
};
