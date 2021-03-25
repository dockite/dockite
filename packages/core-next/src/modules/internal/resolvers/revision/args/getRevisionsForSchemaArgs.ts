import { ArgsType, Field as GraphQLField, Int } from 'type-graphql';

import {
  DEFAULT_PAGINATION_ITEMS_PER_PAGE,
  DEFAULT_PAGINATION_PAGE,
} from '../../../../../common/constants';

/**
 *
 */
@ArgsType()
export class GetRevisionsForSchemaArgs {
  @GraphQLField(_type => String)
  readonly schemaId!: string;

  @GraphQLField(_type => Int, { defaultValue: DEFAULT_PAGINATION_PAGE })
  readonly page!: number;

  @GraphQLField(_type => Int, { defaultValue: DEFAULT_PAGINATION_ITEMS_PER_PAGE })
  readonly perPage!: number;
}

export default GetRevisionsForSchemaArgs;
