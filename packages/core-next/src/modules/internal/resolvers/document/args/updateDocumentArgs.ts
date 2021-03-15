import { GraphQLJSON } from 'graphql-type-json';
import { Field as GraphQLField, InputType } from 'type-graphql';

/**
 *
 */
@InputType()
export class UpdateDocumentArgs {
  @GraphQLField(_type => String)
  readonly id!: string;

  @GraphQLField(_type => GraphQLJSON)
  readonly data!: Record<string, any>;

  @GraphQLField(_type => String, { nullable: true })
  readonly locale?: string;

  @GraphQLField(_type => String, { nullable: true })
  readonly releaseId?: string;
}

export default UpdateDocumentArgs;
