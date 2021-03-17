import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';
import { GraphQLSchema } from 'graphql';
import * as typeorm from 'typeorm';

import { Schema } from '@dockite/database';
import { FieldManager, registerScopeResourceId, registerScopes } from '@dockite/manager';
import { createSchema } from '@dockite/transformer';
import { DockiteConfiguration, ExternalAuthenticationModule, GlobalContext } from '@dockite/types';

import { getConfig } from '../../common/config';
import { SchemaGenerationError } from '../../common/errors';
import { importModule, startTiming } from '../../common/util';

const log = debug('dockite:core:modules:external');

/**
 * Gets the registered external authenticator defaulting back to a mocked authenticator.
 */
const getExternalAuthenticator = async (
  config: DockiteConfiguration,
): Promise<ExternalAuthenticationModule<Schema>> => {
  if (config.externalAuthPackage) {
    return importModule(config.externalAuthPackage);
  }

  return import('./mocks/authenticator');
};

/**
 * Creates the generated GraphQL Schema containing all the user defined schemas and fields.
 *
 * This includes the registration of authorization scopes and addition of external authenticator.
 */
const createGeneratedSchema = async (): Promise<GraphQLSchema> => {
  const elapsed = startTiming();

  try {
    const config = getConfig();

    const authenticator = await getExternalAuthenticator(config);

    const schemaRepository = await typeorm.getRepository(Schema);

    const schemas = await schemaRepository.find({
      relations: ['fields', 'fields.schema'],
    });

    schemas.forEach(schema => {
      const name = schema.name.toLowerCase();

      registerScopes(
        `schema:${name}:create`,
        `schema:${name}:read`,
        `schema:${name}:update`,
        `schema:${name}:delete`,
      );

      registerScopeResourceId(schema.id, name);
    });

    const filteredSchemas = schemas.filter(schema => schema.fields.length > 0);

    // Create the the GraphQL Schema using information that was derrived
    const schema = await createSchema(typeorm, filteredSchemas, FieldManager, authenticator);

    log(`generated api in ${elapsed()} milliseconds`);

    return schema;
  } catch (err) {
    log(err);

    throw new SchemaGenerationError('An error was encountered during schema generation, aborting.');
  }
};

/**
 * Creates the internal graphql modules that will satisfy requests to the /dockite/graphql/internal
 * endpoint.
 */
export const createExternalGraphQLModule = async (): Promise<GraphQLModule> => {
  const schema = await createGeneratedSchema();

  return new GraphQLModule({
    extraSchemas: [schema],
    // We have to passthrough the context from the root module otherwise it will be lost.
    context: (ctx: GlobalContext) => ctx,
  });
};

export default createExternalGraphQLModule;
