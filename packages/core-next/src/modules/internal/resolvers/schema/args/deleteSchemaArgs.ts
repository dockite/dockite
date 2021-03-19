/* eslint-disable max-classes-per-file */
import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `deleteSchema` mutation.
 */
@InputType()
export class DeleteSchemaArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default DeleteSchemaArgs;
