import { ArgsType, Field as GraphQLField } from 'type-graphql';

import { QueryBuilder, WhereBuilderInputType } from '@dockite/where-builder';

import { getRootLocale } from '../../../../../common/util';
import { SortInputType } from '../types';

/**
 * Responsible for the definition of arguments for the `getDocument` query.
 */
@ArgsType()
export class AllDocumentsArgs {
  @GraphQLField(_type => String, { defaultValue: getRootLocale() })
  readonly locale!: string;

  @GraphQLField(_type => Boolean, { nullable: true })
  readonly fallbackLocale!: boolean;

  @GraphQLField(_type => Number, { defaultValue: 1 })
  readonly page!: number;

  @GraphQLField(_type => Number, { defaultValue: 25 })
  readonly perPage!: number;

  @GraphQLField(_type => WhereBuilderInputType, { nullable: true })
  readonly where!: QueryBuilder;

  @GraphQLField(_type => SortInputType, { nullable: true })
  readonly sort!: SortInputType;

  @GraphQLField(_Type => Boolean, { defaultValue: false })
  readonly deleted!: boolean;
}

export default AllDocumentsArgs;
