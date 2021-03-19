/* eslint-disable max-classes-per-file */
import { Min } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, InputType } from 'type-graphql';

import { CreateFieldArgs } from '../../field/args';

/**
 * Omitted for now
 */
@InputType()
export class CreateSchemaFieldArgs extends CreateFieldArgs {
  // We change up the default value to be an empty string since we will
  // reassign it anyway
  @GraphQLField(_type => String, { defaultValue: '' })
  readonly schemaId!: string;
}

/**
 * Responsible for the definition of arguments for the `createSchema` mutation.
 */
@InputType()
export class CreateSchemaArgs {
  @Min(3)
  @GraphQLField(_type => String)
  readonly name!: string;

  @Min(3)
  @GraphQLField(_type => String)
  readonly title!: string;

  @GraphQLField(_type => GraphQLJSON)
  readonly groups!: Record<string, string[]>;

  // @GraphQLField(_type => [CreateFieldArgs])
  // readonly fields!: CreateFieldArgs[];

  @GraphQLField(_type => GraphQLJSON)
  readonly settings!: Record<string, any>;
}

export default CreateSchemaArgs;
