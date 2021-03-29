import { ArgsType, Field as GraphQLField } from 'type-graphql';

import { getRootLocale } from '../../../../../common/util';

/**
 * Responsible for the definition of arguments for the `getSingleton` query.
 */
@ArgsType()
export class GetSingletonByIdArgs {
  @GraphQLField(_type => String)
  readonly id!: string;

  @GraphQLField(_type => String, { defaultValue: getRootLocale() })
  readonly locale!: string;

  @GraphQLField(_Type => Boolean, { defaultValue: false })
  readonly deleted!: boolean;
}

export default GetSingletonByIdArgs;
