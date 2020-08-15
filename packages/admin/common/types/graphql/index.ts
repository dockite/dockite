import { User, Schema, Document, Webhook, WebhookCall, Role, Singleton } from '@dockite/database';
import { DockiteFieldStatic } from '@dockite/types';

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
    user: User;
  };
}

export interface RegisterFirstUserMutationResponse {
  registerFirstUser: {
    token: string;
    user: User;
  };
}

export interface ForgottenPasswordMutationResponse {
  forgottenPassword: boolean;
}

export interface ResetForgottenPasswordMutationResponse {
  resetForgottenPassword: boolean;
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

export type AllSingletonsResultItem = Omit<Singleton, 'user' | 'fields' | 'deletedAt'>;

export interface AllSchemasQueryResponse {
  allSchemas: ManyResultsResponse<AllSchemasResultItem>;
}

export interface AllSingletonsQueryResponse {
  allSingletons: ManyResultsResponse<AllSingletonsResultItem>;
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
export interface AllDocumentRevisionsResultItem {
  id: string;
  data: Record<string, any>;
  user: User;
  userId: string;
  createdAt: Date;
}

export interface AllDocumentRevisionsQueryResponse {
  allDocumentRevisions: ManyResultsResponse<AllDocumentRevisionsResultItem>;
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

export interface GetUserQueryResponse {
  getUser: Omit<User, 'handleNormalizeScopes'>;
}

export interface GetRoleQueryResponse {
  getRole: Role;
}

export interface GetWebhookQueryResponse {
  getWebhook: Webhook;
}

export interface GetSchemaWithFieldsQueryResponse {
  getSchema: Schema;
}

export interface GetSingletonWithFieldsQueryResponse {
  getSingleton: Singleton;
}

export type FindDocumentResultItem = Omit<AllDocumentsWithSchemaResultItem, 'schema'>;

export interface FindDocumentsQueryResponse {
  findDocuments: ManyResultsResponse<FindDocumentResultItem>;
}

export interface AvailableFieldsQueryResponse {
  availableFields: DockiteFieldStatic[];
}

export interface CreateSchemaMutationResponse {
  createSchema: Schema;
}

export interface CreateSingletonMutationResponse {
  createSingleton: Singleton;
}

export interface UpdateSchemaMutationResponse {
  updateSchema: Schema;
}

export interface UpdateSingletonMutationResponse {
  updateSingleton: Singleton;
}

export interface ImportSchemaMutationResponse {
  importSchema: Schema;
}

export interface ImportSingletonMutationResponse {
  importSingleton: Singleton;
}

export interface DeleteSchemaMutationResponse {
  removeSchema: boolean;
}

export interface DeleteSingletonMutationResponse {
  removeSingleton: boolean;
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

export interface PartialUpdateDocumentsInSchemaIdMutationResponse {
  partialUpdateDocumentsInSchemaId: boolean;
}

export interface DeleteDocumentMutationResponse {
  removeDocument: boolean;
}

export type AllWebhooksResultItem = Webhook;

export interface AllWebhooksQueryResponse {
  allWebhooks: ManyResultsResponse<AllWebhooksResultItem>;
}

export type AllUsersResultItem = User;

export interface AllUsersQueryResponse {
  allUsers: ManyResultsResponse<AllUsersResultItem>;
}

export type AllRolesResultItem = Role;

export interface AllRolesQueryResponse {
  allRoles: ManyResultsResponse<AllRolesResultItem>;
}

export interface AllScopesQueryResponse {
  allScopes: string[];
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

export interface UpdateUserMutationResponse {
  updateUser: User;
}
export interface CreateUserMutationResponse {
  createUser: User;
}

export interface DeleteUserMutationResponse {
  removeUser: boolean;
}

export interface ResetUserPasswordMutationResponse {
  resetUserPassword: User;
}

export interface UpdateUserPasswordMutationResponse {
  updatePassword: boolean;
}

export interface UpdateRoleMutationResponse {
  updateRole: Role;
}
export interface CreateRoleMutationResponse {
  createRole: Role;
}

export interface DeleteRoleMutationResponse {
  removeRole: boolean;
}

export interface UpdateWebhookMutationResponse {
  updateWebhook: Webhook;
}

export interface RestoreSchemaRevisionMutationResponse {
  restoreSchemaRevision: boolean;
}

export interface RestoreDocumentRevisionMutationResponse {
  restoreDocumentRevision: boolean;
}

export interface CreateAPIKeyMutationResponse {
  createAPIKey: User;
}

export interface RemoveAPIKeyMutationResponse {
  removeAPIKey: User;
}
