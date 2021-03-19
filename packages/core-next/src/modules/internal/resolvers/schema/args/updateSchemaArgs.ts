/* eslint-disable max-classes-per-file */
import { Min } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 * Responsible for the definition of arguments for the `updateSchema` mutation.
 */
@InputType()
export class UpdateSchemaArgs {
  @GraphQLField(_type => String)
  readonly id!: string;

  @Min(3)
  @GraphQLField(_type => String, { nullable: true })
  readonly name!: string;

  @Min(3)
  @GraphQLField(_type => String, { nullable: true })
  readonly title!: string;

  @GraphQLField(_type => GraphQLJSON)
  readonly groups!: Record<string, string[]>;

  @GraphQLField(_type => GraphQLJSON)
  readonly settings!: Record<string, any>;
}

export default UpdateSchemaArgs;
