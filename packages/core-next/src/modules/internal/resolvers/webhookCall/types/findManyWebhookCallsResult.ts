import { ObjectType } from 'type-graphql';

import { WebhookCall } from '@dockite/database';

import { createFindManyResultType as FindManyResult } from '../../../../../common/util';

/**
 *
 */
@ObjectType()
export class FindManyWebhookCallsResult extends FindManyResult<WebhookCall>(WebhookCall) {}

export default FindManyWebhookCallsResult;
