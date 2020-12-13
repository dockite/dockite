import { Schema } from '@dockite/database';
import { DockiteFieldStatic, GlobalContext } from '@dockite/types';
import debug from 'debug';
import typeorm from 'typeorm';
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfigMap, Source } from 'graphql';

import { AuthenticationModule } from './types';
import DockiteSchema from './schema';
import Auth from './auth';

const log = debug('dockite:transformer:orchestrator');

export default class DockiteSchemaOrchestrator {
  private orm: typeof typeorm;

  private schemas: Schema[];

  private dockiteFieldsMap: Record<string, DockiteFieldStatic>;

  private auth: Auth;

  constructor(
    orm: typeof typeorm,
    schemas: Schema[],
    dockiteFieldsMap: Record<string, DockiteFieldStatic>,
    externalAuthenticationModule: AuthenticationModule,
  ) {
    this.orm = orm;
    this.schemas = schemas;
    this.dockiteFieldsMap = dockiteFieldsMap;
    this.auth = new Auth(externalAuthenticationModule, orm);
  }

  public async orchestrate(): Promise<GraphQLSchema> {
    // Create a set of DockiteSchema instances
    log('Creating Dockite Schemas');
    const dockiteSchemas = this.schemas.map(s => this.makeSchema(s));

    // Create a map for storing output types which is then used during assignment
    // of fields
    const outputTypeMap = new Map<string, GraphQLObjectType>();

    const queries: GraphQLFieldConfigMap<Source, GlobalContext> = {};

    const mutations: GraphQLFieldConfigMap<Source, GlobalContext> = {};

    // Then create their corresponding input and output types
    log('Generating GraphQL Types');
    dockiteSchemas.forEach(schema => {
      schema.makeGraphQLInputType();

      outputTypeMap.set(schema.getName(), schema.makeGraphQLOutputType());
    });

    // Then assign all the corresponding input and output fields to their corresponding
    // GraphQL Object types also creating the queries and mutations for each type.
    log('Assigning fields, queries and mutations to generated GraphQL Types');
    await Promise.all(
      dockiteSchemas.map(async schema => {
        await schema.assignGraphQLOutputTypeFields(
          this.dockiteFieldsMap,
          this.schemas,
          outputTypeMap,
        );

        await schema.assignGraphQLInputTypeFields(
          this.dockiteFieldsMap,
          this.schemas,
          outputTypeMap,
        );

        Object.assign(queries, schema.makeQueries(this.orm, this.auth));

        Object.assign(mutations, schema.makeMutations(this.orm, this.auth));
      }),
    );

    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: queries,
      }),

      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: mutations,
      }),
    });
  }

  private makeSchema(schema: Schema): DockiteSchema {
    return new DockiteSchema(schema);
  }
}
