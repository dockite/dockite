import { ObjectType } from 'type-graphql';

import { SchemaRevision } from '@dockite/database';

import { createFindManyResultType as FindManyResult } from '../../../../../common/util';

/**
 *
 */
@ObjectType()
export class FindManySchemaRevisionsResult extends FindManyResult<SchemaRevision>(SchemaRevision) {}

export default FindManySchemaRevisionsResult;
