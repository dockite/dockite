import { ObjectType } from 'type-graphql';

import { Webhook } from '@dockite/database';

import { createFindManyResultType as FindManyResult } from '../../../../../common/util';

/**
 *
 */
@ObjectType()
export class FindManyWebhooksResult extends FindManyResult<Webhook>(Webhook) {}

export default FindManyWebhooksResult;
