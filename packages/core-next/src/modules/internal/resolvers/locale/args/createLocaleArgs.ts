import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 *
 */
@InputType()
export class CreateLocaleArgs {
  @GraphQLField(_type => String)
  readonly id!: string;

  @GraphQLField(_type => String)
  readonly title!: string;

  @GraphQLField(_type => String)
  readonly icon!: string;
}

export default CreateLocaleArgs;
