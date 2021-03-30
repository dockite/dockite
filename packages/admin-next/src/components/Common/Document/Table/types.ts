import { Document } from '@dockite/database';
import { DockiteGraphQLSortInput } from '@dockite/types';
import { Constraint } from '@dockite/where-builder/lib/types';

import { Nullable } from '~/common/types';

export interface DocumentTableState {
  term: string;
  filters: Record<string, Nullable<Constraint>>;
  sortBy: Nullable<DockiteGraphQLSortInput>;
}

export interface DocumentTableColumn {
  name: string;
  label: string;
  filterable: boolean;
}

export interface DocumentTableColumnDefaultScopedSlot {
  $index: number;
  row: Document;
  column: any;
}
