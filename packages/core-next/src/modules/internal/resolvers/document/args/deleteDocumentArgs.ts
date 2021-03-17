import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `deleteDocument` mutation.
 */
@InputType()
export class DeleteDocumentArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default DeleteDocumentArgs;
