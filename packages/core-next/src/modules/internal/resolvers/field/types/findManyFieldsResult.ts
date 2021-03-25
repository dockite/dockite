import { ObjectType } from 'type-graphql';

import { Field } from '@dockite/database';

import { createFindManyResultType as FindManyResult } from '../../../../../common/util';

/**
 *
 */
@ObjectType()
export class FindManyFieldsResult extends FindManyResult<Field>(Field) {}

export default FindManyFieldsResult;
