import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 *
 */
@InputType()
export class RestoreDocumentRevisionArgs {
  @GraphQLField(_type => String)
  readonly revisionId!: string;

  @GraphQLField(_type => String)
  readonly documentId!: string;
}

export default RestoreDocumentRevisionArgs;
