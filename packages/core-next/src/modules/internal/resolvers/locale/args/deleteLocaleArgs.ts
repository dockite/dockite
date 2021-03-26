import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 *
 */
@InputType()
export class DeleteLocaleArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default DeleteLocaleArgs;
