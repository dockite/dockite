import { ArgsType, Field as GraphQLField } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `getSingleton` query.
 */
@ArgsType()
export class GetSingletonByIdArgs {
  @GraphQLField(_type => String)
  readonly id!: string;

  @GraphQLField(_Type => Boolean, { defaultValue: false })
  readonly deleted!: boolean;
}

export default GetSingletonByIdArgs;
