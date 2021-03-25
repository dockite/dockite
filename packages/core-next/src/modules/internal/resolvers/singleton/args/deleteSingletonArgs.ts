/* eslint-disable max-classes-per-file */
import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `deleteSingleton` mutation.
 */
@InputType()
export class DeleteSingletonArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default DeleteSingletonArgs;
