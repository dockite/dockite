import { ObjectType } from 'type-graphql';

import { Document } from '@dockite/database';

import { createFindManyResultType as FindManyResult } from '../../../../../common/util';

/**
 *
 */
@ObjectType()
export class FindManyDocumentsResult extends FindManyResult<Document>(Document) {}

export default FindManyDocumentsResult;
