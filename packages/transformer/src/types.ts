import { GraphQLObjectType, GraphQLString, GraphQLResolveInfo } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';
import { Schema } from '@dockite/types';
import { QueryBuilder } from '@dockite/where-builder';

export type MaybePromise<T> = T | Promise<T>;
export interface AuthenticationModule {
  authenticated: (
    req: Express.Request,
    info: GraphQLResolveInfo,
    resolverName: string,
    schema: Schema,
  ) => MaybePromise<string | boolean>;
  authorized: (
    req: Express.Request,
    info: GraphQLResolveInfo,
    resolverName: string,
    schema: Schema,
  ) => MaybePromise<boolean>;
}

export interface GetQueryArgs {
  id: string;
}

export interface AllQueryArgs {
  page: number;
  perPage: number;
  where?: QueryBuilder;
  sort?: {
    name: string;
    direction: 'ASC' | 'DESC';
  };
}

export type FindQueryArgs = AllQueryArgs;

export interface CreateMutationArgs {
  input: Record<string, any>;
}

export interface UpdateMutationArgs {
  input: { id: string } & Record<string, any>;
}

export interface DeleteMutationArgs {
  input: { id: string };
}

export const DocumentMetadata = new GraphQLObjectType({
  name: 'DockiteDocumentMetadata',
  fields: {
    id: { type: GraphQLString },
    schemaId: { type: GraphQLString },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    publishedAt: { type: GraphQLDateTime },
  },
});
