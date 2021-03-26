import { ArgsType, Field as GraphQLField } from 'type-graphql';

/**
 *
 */
@ArgsType()
export class GetLocaleArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default GetLocaleArgs;
