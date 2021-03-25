import { ArgsType, Field as GraphQLField, Int } from 'type-graphql';

import { QueryBuilder, WhereBuilderInputType } from '@dockite/where-builder';

import {
  DEFAULT_PAGINATION_ITEMS_PER_PAGE,
  DEFAULT_PAGINATION_PAGE,
} from '../../../../../common/constants';
import { getRootLocale } from '../../../../../common/util';
import { SortInputType } from '../types';

/**
 * Responsible for the definition of arguments for the `getDocument` query.
 */
@ArgsType()
export class AllDocumentsArgs {
  @GraphQLField(_type => String, { nullable: true })
  readonly schemaId?: string;

  @GraphQLField(_type => String, { defaultValue: getRootLocale() })
  readonly locale!: string;

  @GraphQLField(_type => Boolean, { nullable: true })
  readonly fallbackLocale?: boolean;

  @GraphQLField(_type => Int, { defaultValue: DEFAULT_PAGINATION_PAGE })
  readonly page!: number;

  @GraphQLField(_type => Int, { defaultValue: DEFAULT_PAGINATION_ITEMS_PER_PAGE })
  readonly perPage!: number;

  @GraphQLField(_type => WhereBuilderInputType, { nullable: true })
  readonly where?: QueryBuilder;

  @GraphQLField(_type => SortInputType, { nullable: true })
  readonly sort?: SortInputType;

  @GraphQLField(_Type => Boolean, { defaultValue: false })
  readonly deleted!: boolean;
}

export default AllDocumentsArgs;
