import { GlobalContext, Field, Schema } from '@dockite/types';
import debug from 'debug';
import {
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  Source,
  GraphQLFieldConfig,
} from 'graphql';
import { camelCase } from 'lodash';
import { Repository } from 'typeorm';

// const log = debug('dockite:transformer');

const createObjectType = async (entity: Schema): Promise<GraphQLObjectType> => {
  // Build our empty field map
  const typeFields: GraphQLFieldConfigMap<Source, GlobalContext> = {};

  // Retrieve our field configs from the registered dockite-fields
  const fieldsMap: {
    name: string;
    type: GraphQLFieldConfig<Source, GlobalContext>;
  }[] = await Promise.all(
    entity.fields.map(async (field: Field) => ({
      name: field.name,
      // eslint-disable-next-line
      type: await field.dockiteField!.outputType<Source, GlobalContext>(),
    })),
  );

  // Then add all non-null fields
  fieldsMap.forEach(field => {
    if (field.type !== null) {
      typeFields[field.name] = field.type;
    }
  });

  // Finally return the built object type
  return new GraphQLObjectType({
    name: entity.name,
    fields: typeFields,
  });
};

export const createSchemaForEntity = async (
  entity: Schema,
  documentRepository: Repository<any>,
): Promise<GraphQLObjectType> => {
  const objectType = await createObjectType(entity);

  const allQuery = camelCase(`all${entity.name}`);
  const getQuery = camelCase(`get${entity.name}`);

  const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      [getQuery]: {
        type: objectType,
        args: {
          id: { type: GraphQLString },
          name: { type: GraphQLString },
        },
        // eslint-disable-next-line
        resolve(_context, { id, name }): Promise<any> {
          if (id) {
            return documentRepository.findOneOrFail(id);
          }

          if (name) {
            return documentRepository.findOneOrFail({ where: { name } });
          }

          throw new Error(`${entity.name} not found`);
        },
      },

      [allQuery]: {
        type: new GraphQLList(objectType),
        description: entity.settings.description ?? `Retrieves a given ${entity.name}`,
        args: {
          page: { type: GraphQLInt, defaultValue: 1 },
          perPage: { type: GraphQLInt, defaultValue: 25 },
        },
        resolve(_context, { page, perPage }): Promise<Document[]> {
          return documentRepository.find({
            where: {
              deletedAt: null,
            },
            take: perPage,
            skip: page * perPage,
          });
        },
      },
    },
  });

  return queryType;
};
