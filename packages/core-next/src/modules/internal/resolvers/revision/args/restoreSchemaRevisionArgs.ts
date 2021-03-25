import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 *
 */
@InputType()
export class RestoreSchemaRevisionArgs {
  @GraphQLField(_type => String)
  readonly revisionId!: string;

  @GraphQLField(_type => String)
  readonly schemaId!: string;
}

export default RestoreSchemaRevisionArgs;
