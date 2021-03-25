import { ArgsType, Field as GraphQLField } from 'type-graphql';

/**
 *
 */
@ArgsType()
export class GetWebhookCallArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default GetWebhookCallArgs;
