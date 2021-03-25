import { GraphQLJSON } from 'graphql-type-json';
import { Field as GraphQLField, InputType } from 'type-graphql';

import { Singleton } from '@dockite/database';

/**
 * Responsible for the definition of arguments for the `importSingleton` mutation.
 */
@InputType()
export class ImportSingletonArgs {
  @GraphQLField(_type => String, { nullable: true })
  readonly id?: string;

  @GraphQLField(_type => GraphQLJSON)
  readonly payload!: Singleton;
}

export default ImportSingletonArgs;
