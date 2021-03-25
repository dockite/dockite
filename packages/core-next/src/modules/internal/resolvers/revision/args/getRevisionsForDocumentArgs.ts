import { ArgsType, Field as GraphQLField } from 'type-graphql';

import {
  DEFAULT_PAGINATION_ITEMS_PER_PAGE,
  DEFAULT_PAGINATION_PAGE,
} from '../../../../../common/constants';

/**
 *
 */
@ArgsType()
export class GetRevisionsForDocumentArgs {
  @GraphQLField(_type => String)
  readonly documentId!: string;

  @GraphQLField(_type => Number, { defaultValue: DEFAULT_PAGINATION_PAGE })
  readonly page!: number;

  @GraphQLField(_type => Number, { defaultValue: DEFAULT_PAGINATION_ITEMS_PER_PAGE })
  readonly perPage!: number;
}

export default GetRevisionsForDocumentArgs;
