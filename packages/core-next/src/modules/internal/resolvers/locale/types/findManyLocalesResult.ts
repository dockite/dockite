import { ObjectType } from 'type-graphql';

import { Locale } from '@dockite/database';

import { createFindManyResultType as FindManyResult } from '../../../../../common/util';

/**
 *
 */
@ObjectType()
export class FindManyLocalesResult extends FindManyResult<Locale>(Locale) {}

export default FindManyLocalesResult;
