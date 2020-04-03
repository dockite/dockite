export interface DocumentState {
  documentId: string | null;
}

export interface CreateDocumentPayload {
  schemaId: string;
  data: Record<string, any>;
  locale: string;
}
