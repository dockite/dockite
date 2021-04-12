import { Field, Schema } from '@dockite/database';
import { FieldManager, registerScopeResourceId, registerScopes } from '@dockite/manager';
import { createSchema } from '@dockite/transformer';
import { GraphQLSchema } from 'graphql';
import { groupBy } from 'lodash';
import * as typeorm from 'typeorm';
import { In } from 'typeorm';

import { getConfig } from '../../config';
import { getPackage } from '../../utils/get-package';

const config = getConfig();

const getExternalAuthPackage = (): string => {
  if (config.externalAuthPackage) {
    return getPackage(config.externalAuthPackage);
  }

  return './dummy-auth';
};

// TODO: Tidy this area, createSchema likely does not need access to all the items it currently does.
export const createExtraGraphQLSchema = async (): Promise<GraphQLSchema> => {
  const externalAuth = await import(getExternalAuthPackage());

  const dockiteSchemas = await typeorm.getRepository(Schema).find();

  const fields = await typeorm
    .getRepository(Field)
    .find({ where: { schemaId: In(dockiteSchemas.map(s => s.id)) } })
    .then(result => {
      result.forEach(f => {
        const schema = dockiteSchemas.find(s => s.id === f.schemaId);

        if (schema) {
          Object.assign(f, { schema });
        }
      });

      return groupBy(result, 'schemaId');
    });

  dockiteSchemas.forEach(schema => {
    Object.assign(schema, {
      fields: fields[schema.id],
    });

    const schemaName = schema.name.toLowerCase();

    registerScopes(
      `schema:${schemaName}:create`,
      `schema:${schemaName}:read`,
      `schema:${schemaName}:update`,
      `schema:${schemaName}:delete`,
    );

    registerScopeResourceId(schema.id, schemaName);
  });

  const dockiteSchemasFiltered = dockiteSchemas.filter(schema => schema.fields.length > 0);

  const schema = await createSchema(typeorm, dockiteSchemasFiltered, FieldManager, externalAuth);

  return schema;
};
