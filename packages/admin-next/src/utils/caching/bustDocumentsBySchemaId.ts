import { Modifiers } from '@apollo/client/cache/core/types/common';

import { Document } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

/**
 *
 */
export const bustDocumentsBySchemaId = (schemaId: string): Modifiers => {
  return {
    getDocument: (document: Document, details): Document => {
      if (document.schemaId === schemaId) {
        return details.DELETE;
      }

      return document;
    },

    allDocuments: (store: FindManyResult<Document>): FindManyResult<Document> => {
      return {
        ...store,
        results: store.results.filter(document => document.schemaId !== schemaId),
      };
    },

    findDocuments: (store: FindManyResult<Document>): FindManyResult<Document> => {
      return {
        ...store,
        results: store.results.filter(document => document.schemaId !== schemaId),
      };
    },

    searchDocuments: (store: FindManyResult<Document>): FindManyResult<Document> => {
      return {
        ...store,
        results: store.results.filter(document => document.schemaId !== schemaId),
      };
    },
  };
};

export default bustDocumentsBySchemaId;
