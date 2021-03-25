import { ArgsType, Field as GraphQLField } from 'type-graphql';

/**
 *
 */
@ArgsType()
export class GetWebhookArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default GetWebhookArgs;
