import { get } from 'lodash';
import { computed, defineComponent, PropType, WritableComputedRef } from 'vue';

import { Document, Schema } from '@dockite/database';
import { Constraint } from '@dockite/where-builder';

import {
  DocumentTableColumn,
  DocumentTableColumnDefaultScopedSlot,
  DocumentTableState,
} from './types';
import { getFilterComponent, getIdentifierColumn } from './util';

import { Maybe } from '~/common/types';

export interface DocumentTableComponentProps {
  schema?: Schema;
  showSchema: Maybe<boolean>;
  showIdentifier: Maybe<boolean>;
  documents: Document[];
  columns: DocumentTableColumn[];
  state: DocumentTableState;
  getActions: Maybe<(document: Document, schema: Schema) => JSX.Element | JSX.Element[]>;
  getFooter: Maybe<(tab: 'results' | 'selected') => JSX.Element | JSX.Element[]>;
  selectable: boolean;
  selectedItems: Document[];
}

type ComputedDocumentTableComponentProps = {
  [P in keyof DocumentTableComponentProps]: WritableComputedRef<DocumentTableComponentProps[P]>;
};

export const DocumentTableComponent = defineComponent({
  props: {
    schema: {
      type: Object as PropType<DocumentTableComponentProps['schema']>,
    },

    showSchema: {
      type: Boolean as PropType<DocumentTableComponentProps['showSchema']>,
      default: false,
    },

    showIdentifier: {
      type: Boolean as PropType<DocumentTableComponentProps['showIdentifier']>,
      default: false,
    },

    documents: {
      type: Array as PropType<DocumentTableComponentProps['documents']>,
      required: true,
    },

    columns: {
      type: Array as PropType<DocumentTableComponentProps['columns']>,
      required: true,
    },

    state: {
      type: Object as PropType<DocumentTableComponentProps['state']>,
      required: true,
    },

    getActions: {
      type: Function as PropType<DocumentTableComponentProps['getActions']>,
    },

    getFooter: {
      type: Function as PropType<DocumentTableComponentProps['getFooter']>,
    },

    selectable: {
      type: Boolean as PropType<DocumentTableComponentProps['selectable']>,
      default: false,
    },

    selectedItems: {
      type: Array as PropType<DocumentTableComponentProps['selectedItems']>,
    },
  },

  setup: (props, ctx) => {
    const vmodel = Object.keys(props).reduce((acc, curr) => {
      return {
        ...acc,
        [curr]: computed({
          // @ts-expect-error We can index on props due to knowing all current keys
          get: () => props[curr],
          set: value => ctx.emit(`update:${curr}`, value),
        }),
      };
    }, {}) as ComputedDocumentTableComponentProps;

    const selectedIds = computed(() => (props.selectedItems ?? []).map(x => x.id));

    const handleSelectableChange = (value: boolean, document: Document): void => {
      if (props.selectable && props.selectedItems) {
        if (value) {
          vmodel.selectedItems.value.push(document);
        } else {
          vmodel.selectedItems.value = props.selectedItems.filter(d => d.id !== document.id);
        }
      }
    };

    const getSelectableColumn = (): JSX.Element | null => {
      if (props.selectable && props.selectedItems) {
        return (
          <el-table-column label="" prop="id" width="60">
            {{
              default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                <el-checkbox
                  modelValue={selectedIds.value.includes(row.id)}
                  onChange={(v: boolean) => handleSelectableChange(v, row)}
                />
              ),
            }}
          </el-table-column>
        );
      }

      return null;
    };

    const getActionsColumn = (): JSX.Element | null => {
      if (props.getActions) {
        return (
          <el-table-column label="Actions" width="120">
            {{
              default: ({ row }: DocumentTableColumnDefaultScopedSlot) =>
                props.getActions && props.getActions(row, row.schema || props.schema),
            }}
          </el-table-column>
        );
      }

      return null;
    };

    const getColumnData = (document: Document, column: string): any => {
      if (column in document) {
        return get(document, column);
      }

      return get(document.data, column, '');
    };

    const handleApplyConstraint = (column: DocumentTableColumn, constraint: Constraint): void => {
      vmodel.state.value.filters[column.name] = constraint;
    };

    const handleResetConstraint = (column: DocumentTableColumn): void => {
      delete vmodel.state.value.filters[column.name];
    };

    return () => {
      const getColumns = (selectedView = false): JSX.Element[] =>
        props.columns.map(column => (
          <el-table-column minWidth="150">
            {{
              header: () => {
                return (
                  <div class="el-table__column relative">
                    {column.label}

                    {column.filterable &&
                      !selectedView &&
                      getFilterComponent(
                        vmodel.state.value.filters,
                        column,
                        handleApplyConstraint,
                        handleResetConstraint,
                      )}
                  </div>
                );
              },

              default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                <div class="el-table__column">{getColumnData(row, column.name)}</div>
              ),
            }}
          </el-table-column>
        ));

      const baseTable = (
        <div>
          <div class="overflow-x-auto">
            <el-table style="width: 100%;" class="w-full" data={props.documents}>
              {getSelectableColumn()}

              <el-table-column label="ID" prop="id">
                {{
                  default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                    <router-link
                      class="font-mono overflow-ellipsis whitespace-no-wrap break-normal"
                      to={`/documents/${row.id}`}
                    >
                      {row.id}
                    </router-link>
                  ),
                }}
              </el-table-column>

              {props.showSchema && (
                <el-table-column label="Schema">
                  {{
                    default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                      <router-link class="overflow-ellipsis" to={`/schemas/${row.schema?.id}`}>
                        {row.schema?.name}
                      </router-link>
                    ),
                  }}
                </el-table-column>
              )}

              {props.showIdentifier && getIdentifierColumn()}

              {getColumns()}

              <el-table-column label="Created" prop="createdAt" width="150">
                {{
                  default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                    <span>{new Date(row.createdAt).toLocaleString()}</span>
                  ),
                }}
              </el-table-column>

              <el-table-column label="Updated" prop="updatedAt" width="150">
                {{
                  default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                    <span>{new Date(row.updatedAt).toLocaleString()}</span>
                  ),
                }}
              </el-table-column>

              {getActionsColumn()}
            </el-table>
          </div>

          {props.getFooter && props.getFooter('results')}
        </div>
      );

      if (!props.selectable || !props.selectedItems) {
        return baseTable;
      }

      const selectedTable = (
        <div>
          <div class="overflow-x-auto">
            <el-table class="w-full" data={props.selectedItems}>
              {getSelectableColumn()}

              <el-table-column label="ID" prop="id">
                {{
                  default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                    <router-link
                      class="font-mono overflow-ellipsis whitespace-no-wrap break-normal"
                      to={`/documents/${row.id}`}
                    >
                      {row.id}
                    </router-link>
                  ),
                }}
              </el-table-column>

              {props.showSchema && (
                <el-table-column label="Schema">
                  {{
                    default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                      <router-link class="overflow-ellipsis" to={`/schemas/${row.schema?.id}`}>
                        {row.schema?.name}
                      </router-link>
                    ),
                  }}
                </el-table-column>
              )}

              {getColumns(true)}

              {getActionsColumn()}
            </el-table>
          </div>

          {props.getFooter && props.getFooter('selected')}
        </div>
      );

      return (
        <el-tabs type="border-card" style="box-shadow: none;">
          <el-tab-pane label="Results">{baseTable}</el-tab-pane>

          <el-tab-pane label={`Selected Items (${selectedIds.value.length})`}>
            {selectedTable}
          </el-tab-pane>
        </el-tabs>
      );
    };
  },
});

export default DocumentTableComponent;
