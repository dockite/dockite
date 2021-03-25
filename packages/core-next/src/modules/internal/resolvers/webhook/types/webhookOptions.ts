import { GraphQLJSONObject } from 'graphql-type-json';
import { InputType, Field as GraphQLField } from 'type-graphql';

import { WebhookConstraint, WebhookOptions } from '@dockite/database';

/**
 *
 */
@InputType()
export class WebhookOptionsInput implements WebhookOptions {
  @GraphQLField(_type => [String])
  readonly listeners!: string[];

  @GraphQLField(_type => String, { nullable: true })
  readonly query?: string;

  @GraphQLField(_type => [GraphQLJSONObject], { nullable: true })
  readonly constraints?: WebhookConstraint[];
}

export default WebhookOptionsInput;
