import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 *
 */
@InputType()
export class DeleteWebhookArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default DeleteWebhookArgs;
