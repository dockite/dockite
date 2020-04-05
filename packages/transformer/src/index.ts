import { GlobalContext, Field, Document, Schema } from '@dockite/types';
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

const log = debug('dockite:transformer');

const createObjectType = async (entity: Schema): Promise<GraphQLObjectType> => {
  // Build our empty field map
  log(`Building object type for ${entity.name}`);
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

export const createSchemaForEntity = async <T extends Document>(
  entity: Schema,
  repository: Repository<T>,
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
        resolve(_context, { id, name }): Promise<object> {
          if (id) {
            return repository.findOneOrFail(id);
          }

          if (name) {
            return repository.findOneOrFail({ where: { name } });
          }

          throw new Error(`${entity.name} not found`);
        },
      },

      [allQuery]: {
        type: new GraphQLList(objectType),
        description: entity.settings.description ?? `Retrieves all ${entity.name}`,
        args: {
          page: { type: GraphQLInt, defaultValue: 1 },
          perPage: { type: GraphQLInt, defaultValue: 25 },
        },
        async resolve(_context, { page, perPage }): Promise<object[]> {
          const qb = repository
            .createQueryBuilder('document')
            .where('document.schemaId = :schemaId', { schemaId: entity.id })
            .take(perPage)
            .skip(perPage * (page - 1));

          const documents = await qb.getMany();

          return documents;
        },
      },
    },
  });

  return queryType;
};
