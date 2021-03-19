import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `deleteField` mutation.
 */
@InputType()
export class DeleteFieldArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default DeleteFieldArgs;
