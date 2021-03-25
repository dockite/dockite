import { ArgsType, Field as GraphQLField, Int } from 'type-graphql';

import {
  DEFAULT_PAGINATION_ITEMS_PER_PAGE,
  DEFAULT_PAGINATION_PAGE,
} from '../../../../../common/constants';

/**
 *
 */
@ArgsType()
export class AllReleasesArgs {
  @GraphQLField(_type => Int, { defaultValue: DEFAULT_PAGINATION_PAGE })
  readonly page!: number;

  @GraphQLField(_type => Int, { defaultValue: DEFAULT_PAGINATION_ITEMS_PER_PAGE })
  readonly perPage!: number;
}

export default AllReleasesArgs;
