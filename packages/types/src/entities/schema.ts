import { SchemaType } from '../enum';

import { Field } from './field';
import { User } from './user';

export interface Schema {
  id: string;
  name: string;
  type: SchemaType;
  groups: Record<string, string[]>; // eslint-disable-line
  settings: Record<string, any>; // eslint-disable-line
  fields: Field[];
  user: User;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
