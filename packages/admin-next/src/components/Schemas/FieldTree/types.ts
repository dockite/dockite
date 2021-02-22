import { BaseField } from '@dockite/database';

export interface FieldTreeItem {
  title: string;
  type: string;
  children?: FieldTreeItem[];
  _field: BaseField;
}
