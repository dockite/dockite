import { GraphQLJSON } from 'graphql-type-json';
import { Field as GraphQLField, InputType } from 'type-graphql';

import { Schema } from '@dockite/database';

/**
 * Responsible for the definition of arguments for the `importSchema` mutation.
 */
@InputType()
export class ImportSchemaArgs {
  @GraphQLField(_type => String, { nullable: true })
  readonly id?: string;

  @GraphQLField(_type => GraphQLJSON)
  readonly payload!: Schema;
}

export default ImportSchemaArgs;
