/* eslint-disable max-classes-per-file */
import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `restoreSingleton` mutation.
 */
@InputType()
export class RestoreSingletonArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default RestoreSingletonArgs;
