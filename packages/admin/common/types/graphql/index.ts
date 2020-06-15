import { DockiteFieldStatic, Document, Schema, Webhook, WebhookCall, User } from '@dockite/types';

export interface ManyResultsResponse<T> {
  results: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}

export interface LoginMutationResponse {
  login: {
    token: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      createdAt: Date;
      updatedAt: Date;
      verified: boolean;
    };
  };
}

export interface MeQueryResponse {
  me: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    verified: boolean;
  };
}

export type AllSchemasResultItem = Omit<Schema, 'user' | 'fields' | 'deletedAt'>;

export interface AllSchemasQueryResponse {
  allSchemas: ManyResultsResponse<AllSchemasResultItem>;
}

export interface AllSchemaRevisionsResultItem {
  id: string;
  data: Record<string, any>;
  user: User;
  userId: string;
  createdAt: Date;
}

export interface AllSchemaRevisionsQueryResponse {
  allSchemaRevisions: ManyResultsResponse<AllSchemaRevisionsResultItem>;
}

export type AllDocumentsWithSchemaResultItem = Omit<Document, 'user' | 'userId' | 'schemaId'>;

export interface AllDocumentsWithSchemaQueryResponse {
  allDocuments: ManyResultsResponse<AllDocumentsWithSchemaResultItem>;
}

export type SearchDocumentsWithSchemaResultItem = Omit<Document, 'user' | 'userId' | 'schemaId'>;

export interface SearchDocumentsWithSchemaQueryResponse {
  searchDocuments: ManyResultsResponse<SearchDocumentsWithSchemaResultItem>;
}

export interface GetDocumentQueryResponse {
  getDocument: Document;
}

export interface GetSchemaWithFieldsQueryResponse {
  getSchema: Schema;
}

export type FindDocumentResultItem = Omit<AllDocumentsWithSchemaResultItem, 'schema'>;

export interface FindDocumentsQueryResponse {
  findDocuments: ManyResultsResponse<FindDocumentResultItem>;
}

export interface AvailableFieldsQueryResponse {
  availableFields: DockiteFieldStatic[];
}

export interface CreateSchemaMutationResponse {
  createSchema: {
    id: string;
  };
}

export interface UpdateSchemaMutationResponse {
  updateSchema: {
    id: string;
  };
}

export interface DeleteSchemaMutationResponse {
  removeSchema: boolean;
}

export interface CreateFieldMutationResponse {
  createField: {
    id: string;
  };
}

export interface UpdateFieldMutationResponse {
  updateField: {
    id: string;
  };
}
export interface DeleteFieldMutationResponse {
  removeField: boolean;
}

export interface CreateDocumentMutationResponse {
  createDocument: {
    id: string;
  };
}

export interface UpdateDocumentMutationResponse {
  updateDocument: {
    id: string;
  };
}

export interface DeleteDocumentMutationResponse {
  removeDocument: boolean;
}

export type AllWebhooksResultItem = Webhook;

export interface AllWebhooksQueryResponse {
  allWebhooks: ManyResultsResponse<AllWebhooksResultItem>;
}

export type FindWebhookCallsResultItem = WebhookCall;

export interface FindWebhookCallsQueryResponse {
  findWebhookCalls: ManyResultsResponse<FindWebhookCallsResultItem>;
}

export interface CreateWebhookMutationResponse {
  createWebhook: Webhook;
}

export interface DeleteWebhookMutationResponse {
  removeWebhook: boolean;
}

export interface UpdateWebhookMutationResponse {
  updateWebhook: Webhook;
}
