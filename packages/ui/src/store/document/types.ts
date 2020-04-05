export interface DocumentState {
  documentId: string | null;
}

export interface CreateDocumentPayload {
  schemaId: string;
  data: Record<string, any>; // eslint-disable-line
  locale: string;
}
export interface UpdateDocumentPayload {
  id: string;
  data: Record<string, any>; // eslint-disable-line
}
