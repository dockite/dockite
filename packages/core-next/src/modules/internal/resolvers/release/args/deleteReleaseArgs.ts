import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 *
 */
@InputType()
export class DeleteReleaseArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default DeleteReleaseArgs;
