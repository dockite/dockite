import { SchemaType } from '../enum';

import { Field, User } from '.';

export interface Schema {
  id: string;
  name: string;
  type: SchemaType;
  groups: any; // eslint-disable-line
  settings: any; // eslint-disable-line
  fields: Field[];
  user: User;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
