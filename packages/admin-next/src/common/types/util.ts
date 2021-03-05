import { Document, Schema } from '@dockite/database';
import { SchemaType } from '@dockite/database/lib/types';

export type MaybePromise<T> = T | Promise<T>;

export type Maybe<T> = T | undefined;

export type Nullable<T> = T | null;

export type MaybePersisted<T> = T & { id?: string };

export type BaseSchema = Pick<Schema, 'name' | 'title' | 'type' | 'groups' | 'settings' | 'fields'>;

export type BaseDocument = Pick<Document, 'locale' | 'data' | 'schemaId'>;

export interface ValidateError {
  message: string;
  field: string;
}

export type ErrorList = ValidateError[];
export interface FieldErrorList {
  [field: string]: ValidateError[];
}

export { SchemaType };
