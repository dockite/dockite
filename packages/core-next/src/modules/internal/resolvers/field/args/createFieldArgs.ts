import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, InputType } from 'type-graphql';

import { FieldSettings } from '@dockite/types';

/**
 * Responsible for the definition of arguments for the `createField` mutation.
 */
@InputType()
export class CreateFieldArgs {
  @GraphQLField(_type => String)
  readonly name!: string;

  @GraphQLField(_type => String)
  readonly title!: string;

  @GraphQLField(_type => String, { defaultValue: '' })
  readonly description!: string;

  @GraphQLField(_type => String)
  readonly type!: string;

  @GraphQLField(_type => Number, { defaultValue: 0 })
  readonly priority!: number;

  @GraphQLField(_type => GraphQLJSON)
  readonly settings!: FieldSettings;

  @GraphQLField(_type => String)
  readonly schemaId!: string;
}

export default CreateFieldArgs;
