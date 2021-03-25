import { Method } from 'axios';
import { Field as GraphQLField, InputType } from 'type-graphql';

import { WebhookOptions } from '@dockite/database';

import { WebhookOptionsInput } from '../types';

/**
 *
 */
@InputType()
export class UpdateWebhookArgs {
  @GraphQLField(_type => String)
  readonly id!: string;

  @GraphQLField(_type => String)
  readonly name!: string;

  @GraphQLField(_type => String)
  readonly url!: string;

  @GraphQLField(_type => String)
  readonly method!: Method;

  @GraphQLField(_type => WebhookOptionsInput)
  readonly options!: WebhookOptions;
}

export default UpdateWebhookArgs;
