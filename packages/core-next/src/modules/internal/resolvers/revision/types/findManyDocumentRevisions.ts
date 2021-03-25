import { ObjectType } from 'type-graphql';

import { DocumentRevision } from '@dockite/database';

import { createFindManyResultType as FindManyResult } from '../../../../../common/util';

/**
 *
 */
@ObjectType()
export class FindManyDocumentRevisionsResult extends FindManyResult<DocumentRevision>(
  DocumentRevision,
) {}

export default FindManyDocumentRevisionsResult;
