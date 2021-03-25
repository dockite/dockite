import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 *
 */
@InputType()
export class PublishReleaseArgs {
  @GraphQLField(_type => String)
  readonly id!: string;
}

export default PublishReleaseArgs;
