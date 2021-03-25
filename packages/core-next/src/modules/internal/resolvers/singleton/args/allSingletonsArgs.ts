import { ArgsType, Field as GraphQLField } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `allSingletons` query.
 */
@ArgsType()
export class AllSingletonsArgs {
  @GraphQLField(_Type => Boolean, { defaultValue: false })
  readonly deleted!: boolean;
}

export default AllSingletonsArgs;
