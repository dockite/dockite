import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `restoreDocument` mutation.
 */
@InputType()
export class RestoreDocumentArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default RestoreDocumentArgs;
