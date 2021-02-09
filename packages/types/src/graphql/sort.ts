import { GraphQLEnumType, GraphQLInputObjectType, GraphQLString } from 'graphql';

export enum DockiteSortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface DockiteGraphQLSortInput {
  name: string;
  direction: DockiteSortDirection;
}

export const DockiteGraphqlSortDirection = new GraphQLEnumType({
  name: 'DockiteSortDirection',
  values: {
    ASC: { value: 'ASC' },
    DESC: { value: 'DESC' },
  },
});

export const DockiteGraphqlSortInputType = new GraphQLInputObjectType({
  name: 'DockiteGraphqlSortInputType',
  fields: {
    name: { type: GraphQLString },
    direction: { type: DockiteGraphqlSortDirection },
  },
});
