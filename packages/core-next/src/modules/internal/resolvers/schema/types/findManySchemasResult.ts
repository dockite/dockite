import { ObjectType } from 'type-graphql';

import { Schema } from '@dockite/database';

import { createFindManyResultType as FindManyResult } from '../../../../../common/util';

/**
 *
 */
@ObjectType()
export class FindManySchemasResult extends FindManyResult<Schema>(Schema) {}

export default FindManySchemasResult;
