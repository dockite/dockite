import { GraphQLJSON } from 'graphql-type-json';
import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `partialUpdateDocumentsInSchema` mutation.
 */
@InputType()
export class PartialUpdateDocumentsInSchemaArgs {
  @GraphQLField(_type => String)
  readonly schemaId!: string;

  @GraphQLField(_type => [String])
  readonly documentIds!: string[];

  @GraphQLField(_type => GraphQLJSON)
  readonly data!: Record<string, any>;
}

export default PartialUpdateDocumentsInSchemaArgs;
