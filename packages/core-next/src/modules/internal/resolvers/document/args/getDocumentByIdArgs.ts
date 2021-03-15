import { ArgsType, Field as GraphQLField } from 'type-graphql';

import { getRootLocale } from '../../../../../common/util';

/**
 * Responsible for the definition of arguments for the `getDocument` query.
 */
@ArgsType()
export class GetDocumentByIdArgs {
  @GraphQLField(_type => String)
  readonly id!: string;

  @GraphQLField(_type => String, { defaultValue: getRootLocale() })
  readonly locale!: string;

  @GraphQLField(_type => Boolean, { nullable: true })
  readonly fallbackLocale!: boolean;

  @GraphQLField(_Type => Boolean, { defaultValue: false })
  readonly deleted!: boolean;
}

export default GetDocumentByIdArgs;
