import { Min, IsEmail } from 'class-validator';
import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 * Describes the arguements required for the login mutation.
 */
@InputType()
export class LoginInputArgs {
  @IsEmail()
  @GraphQLField(_type => String)
  public email!: string;

  @Min(6)
  @GraphQLField(_type => String)
  public password!: string;
}

export default LoginInputArgs;
