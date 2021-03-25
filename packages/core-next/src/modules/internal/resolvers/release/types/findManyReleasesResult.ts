import { ObjectType } from 'type-graphql';

import { Release } from '@dockite/database';

import { createFindManyResultType as FindManyResult } from '../../../../../common/util';

/**
 *
 */
@ObjectType()
export class FindManyReleasesResult extends FindManyResult<Release>(Release) {}

export default FindManyReleasesResult;
