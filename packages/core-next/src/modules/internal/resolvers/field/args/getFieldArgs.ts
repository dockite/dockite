import { ArgsType, Field as GraphQLField } from 'type-graphql';

/**
 *
 */
@ArgsType()
export class GetFieldArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default GetFieldArgs;
