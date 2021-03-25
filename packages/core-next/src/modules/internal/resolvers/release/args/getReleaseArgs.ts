import { ArgsType, Field as GraphQLField } from 'type-graphql';

/**
 *
 */
@ArgsType()
export class GetReleaseArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default GetReleaseArgs;
