import { ArgsType, Field as GraphQLField } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `allSchemas` query.
 */
@ArgsType()
export class AllSchemasArgs {
  @GraphQLField(_Type => Boolean, { defaultValue: false })
  readonly deleted!: boolean;
}

export default AllSchemasArgs;
