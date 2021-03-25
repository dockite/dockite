import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 *
 */
@InputType()
export class CreateReleaseArgs {
  @GraphQLField(_type => String)
  readonly name!: string;

  @GraphQLField(_type => String)
  readonly description!: string;

  @GraphQLField(_type => Date)
  readonly scheduledFor!: Date;
}

export default CreateReleaseArgs;
