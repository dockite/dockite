import { DockiteFieldStatic } from '@dockite/field';
import { Schema, Document } from '@dockite/types';

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

export type AllDocumentsWithSchemaResultItem = Omit<Document, 'user' | 'userId' | 'schemaId'>;

export interface AllDocumentsWithSchemaQueryResponse {
  allDocuments: ManyResultsResponse<AllDocumentsWithSchemaResultItem>;
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
