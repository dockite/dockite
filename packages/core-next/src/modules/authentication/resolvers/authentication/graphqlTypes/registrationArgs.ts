import { Min, IsEmail } from 'class-validator';
import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 * Describes the arguements required for the registration mutation.
 */
@InputType()
export class RegistrationInputArgs {
  @IsEmail()
  @GraphQLField(_type => String)
  public email!: string;

  @Min(6)
  @GraphQLField(_type => String)
  public password!: string;

  @GraphQLField(_type => String)
  public firstName!: string;

  @GraphQLField(_type => String)
  public lastName!: string;
}

export default RegistrationInputArgs;
