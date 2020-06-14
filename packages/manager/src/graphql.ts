import { GraphQLSchema } from 'graphql';

export type DockiteSchemaManager = Record<string, GraphQLSchema>;

export const SchemaManager: DockiteSchemaManager = {};
