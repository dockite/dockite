import { ArgsType, Field as GraphQLField } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `getSchema` query.
 */
@ArgsType()
export class GetSchemaByIdArgs {
  @GraphQLField(_type => String)
  readonly id!: string;

  @GraphQLField(_Type => Boolean, { defaultValue: false })
  readonly deleted!: boolean;
}

export default GetSchemaByIdArgs;
