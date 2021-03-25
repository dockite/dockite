import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';

/**
 *
 */
@ObjectType()
export class RegisteredDockiteField {
  @GraphQLField(_type => String)
  readonly type!: string;

  @GraphQLField(_type => String)
  readonly title!: string;

  @GraphQLField(_type => String)
  readonly description!: string;

  @GraphQLField(_type => GraphQLJSON)
  readonly defaultOptions!: Record<string, any>;
}

export default RegisteredDockiteField;
