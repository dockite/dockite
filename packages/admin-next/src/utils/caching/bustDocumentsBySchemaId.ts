import { Modifiers } from '@apollo/client/cache/core/types/common';

import { Document } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

export const bustDocumentsBySchemaId = (schemaId: string): Modifiers => {
  return {
    allDocuments: (documents: FindManyResult<Document>): FindManyResult<Document> => {
      return {
        ...documents,
        results: documents.results.filter(document => document.schemaId !== schemaId),
      };
    },
    findDocuments: (documents: FindManyResult<Document>): FindManyResult<Document> => {
      return {
        ...documents,
        results: documents.results.filter(document => document.schemaId !== schemaId),
      };
    },
    searchDocuments: (documents: FindManyResult<Document>): FindManyResult<Document> => {
      return {
        ...documents,
        results: documents.results.filter(document => document.schemaId !== schemaId),
      };
    },
  };
};

export default bustDocumentsBySchemaId;
