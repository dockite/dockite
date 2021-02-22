import { BaseField } from '@dockite/database';

export interface FieldTreeItem {
  id: string;
  title: string;
  type: string;
  children?: FieldTreeItem[];
  _field: BaseField;
}
