import { User, Document } from '.';

export interface Release {
  id: string;
  name: string;
  description: string;
  documents: Document[];
  user: User;
  userId: string;
  scheduledFor?: Date | null;
  publishedAt?: Date | null;
  publishedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
