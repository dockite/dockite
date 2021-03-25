import { ObjectType } from 'type-graphql';

import { Singleton } from '@dockite/database';

import { createFindManyResultType as FindManyResult } from '../../../../../common/util';

/**
 *
 */
@ObjectType()
export class FindManySingletonsResult extends FindManyResult<Singleton>(Singleton) {}

export default FindManySingletonsResult;
