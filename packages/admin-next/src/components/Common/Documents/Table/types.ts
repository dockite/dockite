import { Document } from '@dockite/database';
import { DockiteGraphqlSortInput as DockiteGraphQLSortInput } from '@dockite/types';
import { Constraint } from '@dockite/where-builder';

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
