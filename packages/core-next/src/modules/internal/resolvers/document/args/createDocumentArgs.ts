import { GraphQLJSON } from 'graphql-type-json';
import { Field as GraphQLField, InputType } from 'type-graphql';

import { getRootLocale } from '../../../../../common/util';

/**
 * Responsible for the definition of arguments for the `updateDocument` mutation.
 */
@InputType()
export class CreateDocumentArgs {
  @GraphQLField(_type => String)
  readonly schemaId!: string;

  @GraphQLField(_type => GraphQLJSON)
  readonly data!: Record<string, any>;

  @GraphQLField(_type => String, { defaultValue: getRootLocale() })
  readonly locale!: string;

  @GraphQLField(_type => String, { nullable: true })
  readonly parentId?: string;
}

export default CreateDocumentArgs;
