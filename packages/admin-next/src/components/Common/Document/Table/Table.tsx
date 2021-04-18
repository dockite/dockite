import { get, fromPairs } from 'lodash';
import { computed, defineComponent, PropType, toRaw, WritableComputedRef } from 'vue';

import { Document, Schema } from '@dockite/database';
import { SchemaType } from '@dockite/types';
import { Constraint } from '@dockite/where-builder/lib/types';

import {
  DocumentTableColumn,
  DocumentTableColumnDefaultScopedSlot,
  DocumentTableState,
} from './types';
import { getFilterComponent, getIdentifierColumn } from './util';

import { Maybe } from '~/common/types';
import { useDockite } from '~/dockite';

export interface DocumentTableComponentProps {
  schema?: Schema;
  showSchemaColumn: Maybe<boolean>;
  showIdentifierColumn: Maybe<boolean>;
  documents: Document[];
  updatableColumns: boolean;
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
  name: 'DocumentTableComponent',

  props: {
    schema: {
      type: Object as PropType<DocumentTableComponentProps['schema']>,
    },

    showSchemaColumn: {
      type: Boolean as PropType<DocumentTableComponentProps['showSchemaColumn']>,
      default: false,
    },

    showIdentifierColumn: {
      type: Boolean as PropType<DocumentTableComponentProps['showIdentifierColumn']>,
      default: false,
    },

    documents: {
      type: Array as PropType<DocumentTableComponentProps['documents']>,
      required: true,
    },

    updatableColumns: {
      type: Boolean as PropType<DocumentTableComponentProps['updatableColumns']>,
      default: false,
    },

    columns: {
      type: Array as PropType<DocumentTableComponentProps['columns']>,
      // required: true,
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
    // Create an object containing the computed keys of the provided props to allow for 2 way binding.
    const vmodel = fromPairs(
      Object.keys(props).map(key => {
        const model = computed({
          // @ts-expect-error Indexing is fine here since keys are known
          get: () => props[key],
          set: value => ctx.emit(`update:${key}`, value),
        });

        return [key, model];
      }),
    ) as ComputedDocumentTableComponentProps;

    const { fieldManager } = useDockite();

    // Stores a computed list of the selected item ids
    const selectedItemIds = computed(() => (props.selectedItems ?? []).map(x => x.id));

    // Handles the changing of a selectable document in either the results or selected table.
    const handleSelectedItemChange = (value: boolean, document: Document): void => {
      if (props.selectable && props.selectedItems) {
        if (value && !vmodel.selectedItems.value.find(item => item.id === document.id)) {
          vmodel.selectedItems.value.push(document);
        } else {
          vmodel.selectedItems.value = props.selectedItems.filter(d => d.id !== document.id);
        }
      }
    };

    // Handles the changing of a column via the column dropdown.
    const handleColumnChange = (value: boolean, column: DocumentTableColumn): void => {
      if (props.updatableColumns && props.columns) {
        if (value && !vmodel.columns.value.find(col => col.name === column.name)) {
          vmodel.columns.value = [...vmodel.columns.value, column];
        } else {
          vmodel.columns.value = vmodel.columns.value.filter(col => col.name !== column.name);
        }
      }
    };

    // Handles the application of a constraint (filter) to the current table view.
    const handleApplyConstraint = (column: DocumentTableColumn, constraint: Constraint): void => {
      vmodel.state.value.filters[column.name] = constraint;
    };

    // Handles the removal of a constraint (filter) from the current table view.
    const handleRemoveConstraint = (column: DocumentTableColumn): void => {
      delete vmodel.state.value.filters[column.name];
    };

    const getRawColumnData = (document: Document, column: string): any => {
      if (column in document) {
        return get(document, column);
      }

      return get(document.data, column, '');
    };

    /**
     * Given a document and column path, retrieve the associated data and format it as
     * best as possible provided the lack of dedicated field view.
     *
     * @param document The document to retrieve data from
     * @param column The path to the column
     */
    const getColumnData = (document: Document, column: string): string => {
      const columnData = getRawColumnData(document, column);

      if (columnData === null) {
        return '';
      }

      const columnAsDate = new Date(columnData);

      if (!Number.isNaN(columnAsDate.getTime())) {
        return columnAsDate.toLocaleString();
      }

      if (typeof columnData === 'boolean') {
        return columnData ? 'True' : 'False';
      }

      if (Array.isArray(columnData)) {
        return '[ArrayData]';
      }

      if (typeof columnData === 'object') {
        return '{ObjectData}';
      }

      return String(columnData);
    };

    const getSelectableColumnView = (): JSX.Element | null => {
      if (props.selectable && props.selectedItems) {
        return (
          <el-table-column label="" prop="id" width="60">
            {{
              default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                <el-checkbox
                  modelValue={selectedItemIds.value.includes(row.id)}
                  onChange={(v: boolean) => handleSelectedItemChange(v, row)}
                />
              ),
            }}
          </el-table-column>
        );
      }

      return null;
    };

    const getActionsColumnView = (): JSX.Element | null => {
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

    return () => {
      const getTableColumns = (selectedView = false): JSX.Element[] =>
        props.columns!.map(column => (
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
                        handleRemoveConstraint,
                      )}
                  </div>
                );
              },

              default: ({ row }: DocumentTableColumnDefaultScopedSlot) => {
                if (props.schema) {
                  const field = props.schema.fields.find(field => field.name === column.name);

                  if (field && fieldManager[field.type] && fieldManager[field.type].view) {
                    const ViewComponent = toRaw(fieldManager[field.type].view);

                    if (ViewComponent) {
                      return (
                        <div class="el-table__column">
                          <ViewComponent
                            modelValue={getRawColumnData(row, column.name)}
                            field={field}
                          />
                        </div>
                      );
                    }
                  }
                }

                return <div class="el-table__column">{getColumnData(row, column.name)}</div>;
              },
            }}
          </el-table-column>
        ));

      const baseTable = (
        <div>
          <div class="overflow-x-auto">
            <el-table style="width: 100%;" class="w-full" data={props.documents}>
              {getSelectableColumnView()}

              <el-table-column label="ID" prop="id">
                {{
                  default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                    <router-link class="font-mono truncate" to={`/documents/${row.id}`}>
                      {row.id}
                    </router-link>
                  ),
                }}
              </el-table-column>

              {props.showSchemaColumn && (
                <el-table-column label="Schema">
                  {{
                    default: ({ row }: DocumentTableColumnDefaultScopedSlot) => {
                      if (row.schema?.type === SchemaType.SINGLETON) {
                        return (
                          <router-link
                            class="overflow-ellipsis"
                            to={`/singletons/${row.schema?.id}`}
                          >
                            {row.schema?.name}
                          </router-link>
                        );
                      }

                      return (
                        <router-link class="overflow-ellipsis" to={`/schemas/${row.schema?.id}`}>
                          {row.schema?.name}
                        </router-link>
                      );
                    },
                  }}
                </el-table-column>
              )}

              {props.showIdentifierColumn && getIdentifierColumn()}

              {getTableColumns()}

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

              {getActionsColumnView()}
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
              {getSelectableColumnView()}

              <el-table-column label="ID" prop="id">
                {{
                  default: ({ row }: DocumentTableColumnDefaultScopedSlot) => (
                    <router-link class="font-mono truncate" to={`/documents/${row.id}`}>
                      {row.id}
                    </router-link>
                  ),
                }}
              </el-table-column>

              {props.showSchemaColumn && (
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

              {getTableColumns(true)}

              {getActionsColumnView()}
            </el-table>
          </div>

          {props.getFooter && props.getFooter('selected')}
        </div>
      );

      return (
        <div class="relative">
          <div
            class={{
              'absolute right-0 top-0 py-2 px-3 z-50': true,
              hidden: !props.updatableColumns,
            }}
          >
            <el-popover trigger="click" title="Displayed Columns" width="auto">
              {{
                reference: () => <i class="el-icon-setting cursor-pointer p-1" role="button" />,
                default: () => (
                  <div
                    class="overflow-auto flex flex-col"
                    style={{ maxHeight: '400px', maxWidth: '400px' }}
                  >
                    {(props.schema?.fields || []).map(field => {
                      const column: DocumentTableColumn = {
                        name: field.name,
                        label: field.title,
                        filterable: true,
                      };

                      return (
                        <el-checkbox
                          modelValue={(props.columns || []).some(c => c.name === column.name)}
                          onChange={(v: boolean) => handleColumnChange(v, column)}
                          class="mb-1"
                        >
                          {column.label}
                        </el-checkbox>
                      );
                    })}
                  </div>
                ),
              }}
            </el-popover>
          </div>

          <el-tabs type="border-card" style="box-shadow: none;">
            <el-tab-pane label="Results">{baseTable}</el-tab-pane>

            <el-tab-pane label={`Selected Items (${selectedItemIds.value.length})`}>
              {selectedTable}
            </el-tab-pane>
          </el-tabs>
        </div>
      );
    };
  },
});

export default DocumentTableComponent;
