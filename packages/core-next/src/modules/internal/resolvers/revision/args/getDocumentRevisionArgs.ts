import { ArgsType, Field as GraphQLField } from 'type-graphql';

/**
 *
 */
@ArgsType()
export class GetDocumentRevisionArgs {
  @GraphQLField(_type => String)
  readonly documentId!: string;

  @GraphQLField(_type => String)
  readonly revisionId!: string;
}

export default GetDocumentRevisionArgs;
