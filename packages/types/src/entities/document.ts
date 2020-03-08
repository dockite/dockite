import { Schema, Release, User } from '.';

export interface Document {
  id: string;
  locale: string;
  data: any; // eslint-disable-line
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  schemaId: string;
  schema: Schema;
  releaseId?: string | null;
  release: Release;
  userId?: string | null;
  user: User;
}
