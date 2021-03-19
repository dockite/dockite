import { Document, DocumentRevision } from '@dockite/database';

export interface DocumentsAndRevisionsResult {
  document: Document;
  revision: DocumentRevision;
}
