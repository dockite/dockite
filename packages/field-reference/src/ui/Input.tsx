import { cloneDeep, debounce } from 'lodash';
import { computed, defineComponent, inject, PropType, reactive, ref, toRefs, watch } from 'vue';

import { Document } from '@dockite/database';
import { DockiteFieldInputComponentProps, FindManyResult } from '@dockite/types';
import { AndQuery, Constraint, PossibleConstraints } from '@dockite/where-builder/lib/types';

import {
  DockiteFieldReferenceEntity,
  DocumentTableColumnDefaultScopedSlot,
  GraphQLResult,
  ReferenceFieldValue,
  RESULTS_PER_PAGE,
} from '../types';

import {
  GetDocumentByIdQueryResponse,
  GET_DOCUMENT_BY_ID_QUERY,
  SearchDocumentsQueryResponse,
  SEARCH_DOCUMENTS_QUERY,
} from './queries';
import {
  DocumentTableColumn,
  DocumentTableState,
  getFilterComponent,
  getPaginationString,
} from './util';

import './Input.scss';

export type InputComponentProps = DockiteFieldInputComponentProps<
  ReferenceFieldValue,
  DockiteFieldReferenceEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldReferenceInput',

  props: {
    name: {
      type: String as PropType<InputComponentProps['name']>,
      required: true,
    },

    modelValue: {
      type: (null as any) as PropType<InputComponentProps['value']>,
      required: true,
    },

    formData: {
      type: Object as PropType<InputComponentProps['formData']>,
      required: true,
    },

    fieldConfig: {
      type: Object as PropType<InputComponentProps['fieldConfig']>,
      required: true,
    },

    errors: {
      type: Object as PropType<InputComponentProps['errors']>,
      required: true,
    },
  },

  setup: (props, ctx) => {
    const { errors, fieldConfig, modelValue, name } = toRefs(props);

    const fieldData = computed({
      get: () => modelValue.value,
      set: newValue => ctx.emit('update:modelValue', newValue),
    });

    const $graphql = inject<any>('$graphql');

    const rules = ref<Array<Record<string, any>>>([]);

    const tableState = reactive<DocumentTableState>({
      term: '',
      filters: {},
      sortBy: null,
    });

    const visible = ref(false);

    const target = ref<Document | null>(null);

    const results = ref<FindManyResult<Document> | null>(null);

    const getIdentifier = (doc: Document): string => {
      if (doc.data.name) {
        return doc.data.name;
      }

      if (doc.data.title) {
        return doc.data.title;
      }

      if (doc.data.identifier) {
        return doc.data.identifier;
      }

      return doc.id;
    };

    const handleShowDialog = (): void => {
      visible.value = true;
    };

    const handleHideDialog = (): void => {
      visible.value = false;
    };

    const handleSelectDocument = (doc: Document): void => {
      fieldData.value = {
        id: doc.id,
        schemaId: doc.schemaId,
        identifier: getIdentifier(doc),
      };

      handleHideDialog();
    };

    // Handles the application of a constraint (filter) to the current table view.
    const handleApplyConstraint = (column: DocumentTableColumn, constraint: Constraint): void => {
      tableState.filters[column.name] = constraint;
    };

    // Handles the removal of a constraint (filter) from the current table view.
    const handleRemoveConstraint = (column: DocumentTableColumn): void => {
      delete tableState.filters[column.name];
    };

    const handleRemoveReference = (): void => {
      fieldData.value = null;
    };

    const fetchTargetDocument = async (): Promise<void> => {
      if (fieldData.value) {
        const { data }: GraphQLResult<GetDocumentByIdQueryResponse> = await $graphql.executeQuery({
          query: GET_DOCUMENT_BY_ID_QUERY,
          variables: {
            id: fieldData.value.id,
          },
        });

        if (data) {
          target.value = cloneDeep(data.getDocument);
        }
      }
    };

    const fetchReferenceDocuments = async (page = 1): Promise<void> => {
      const constraints = Object.values(tableState.filters).filter(
        f => !!f,
      ) as PossibleConstraints[];

      if (
        fieldConfig.value.settings.constraints &&
        fieldConfig.value.settings.constraints.length > 0
      ) {
        constraints.push(...fieldConfig.value.settings.constraints);
      }

      let where: AndQuery | null = null;

      if (constraints.length > 0) {
        where = { AND: [...constraints] };
      }

      const { data }: GraphQLResult<SearchDocumentsQueryResponse> = await $graphql.executeQuery({
        query: SEARCH_DOCUMENTS_QUERY,
        variables: {
          schemaIds: fieldConfig.value.settings.schemaIds,
          term: tableState.term,
          perPage: RESULTS_PER_PAGE,
          page,
          where,
        },
      });

      if (data) {
        results.value = cloneDeep(data.searchDocuments);
      }
    };

    const fetchReferenceDocumentsDebounced = debounce(fetchReferenceDocuments, 150);

    watch(fieldData, () => {
      fetchTargetDocument();
    });

    watch(visible, () => {
      if (visible.value && tableState) {
        fetchReferenceDocuments();
      }
    });

    watch(tableState, () => {
      fetchReferenceDocumentsDebounced();
    });

    const getInputComponent = (): JSX.Element => {
      if (modelValue.value) {
        return (
          <div class="p-3 border rounded shadow flex justify-between items-center leading-normal">
            <div>
              <strong>{target.value && target.value.schema.title}</strong>
              {' - '}
              <span>{target.value && getIdentifier(target.value)}</span>

              <small class="block">{fieldData.value && fieldData.value.id}</small>
            </div>

            <el-button
              class="rounded hover:bg-gray-200"
              icon="el-icon-close"
              size="small"
              type="text"
              onClick={handleRemoveReference}
            />
          </div>
        );
      }

      const getTableColumnsView = (): JSX.Element | JSX.Element[] => {
        if (
          !fieldConfig.value.settings.fieldsToDisplay ||
          fieldConfig.value.settings.fieldsToDisplay.length === 0
        ) {
          return (
            <el-table-column label="Identifier">
              {{
                default: (scope: DocumentTableColumnDefaultScopedSlot) => (
                  <span>{getIdentifier(scope.row)}</span>
                ),
              }}
            </el-table-column>
          );
        }

        const columns: DocumentTableColumn[] = fieldConfig.value.settings.fieldsToDisplay.map(f => {
          return {
            name: f.name,
            label: f.label,
            filterable: true,
          };
        });

        return columns.map(column =>
          getFilterComponent(
            tableState.filters,
            column,
            handleApplyConstraint,
            handleRemoveConstraint,
          ),
        );
      };

      return (
        <>
          <div
            class="p-3 border rounded cursor-pointer hover:bg-gray-200 shadow flex justify-between items-center"
            onClick={() => handleShowDialog()}
          >
            Select a Document
          </div>

          <el-dialog
            v-model={visible.value}
            title="Select a Document"
            top="5vh"
            width=""
            customClass="w-11/12 max-w-screen-xl px-3"
            destroyOnClose
          >
            <div class="flex items-center justify-between -mt-5 pb-3">
              <span />

              <el-input
                v-model={tableState.term}
                placeholder="Search Term"
                style={{ maxWidth: '400px' }}
              />
            </div>

            {results.value && (
              <div class="border rounded">
                <el-table
                  data={results.value.results}
                  rowKey={(r: Document) => r.id}
                  maxHeight="60vh"
                >
                  <el-table-column label="" width={50}>
                    {{
                      default: (scope: DocumentTableColumnDefaultScopedSlot) => (
                        <input
                          type="radio"
                          value={scope.row.id}
                          // @ts-expect-error
                          selected={() => scope.row === target.value}
                          onInput={() => handleSelectDocument(scope.row)}
                        />
                      ),
                    }}
                  </el-table-column>

                  <el-table-column label="ID" prop="id">
                    {{
                      default: (scope: DocumentTableColumnDefaultScopedSlot) => (
                        <span class="truncate">{scope.row.id}</span>
                      ),
                    }}
                  </el-table-column>

                  {getTableColumnsView()}
                </el-table>

                <div class="flex justify-between items-center p-3 leading-normal">
                  <span>{getPaginationString(results.value)}</span>

                  <el-pagination
                    currentPage={results.value.currentPage || 1}
                    pageSize={RESULTS_PER_PAGE}
                    layout="prev, pager, next"
                    pageCount={results.value.totalPages || 0}
                    onCurrentChange={(newPage: number) => {
                      fetchReferenceDocuments(newPage);
                    }}
                  />
                </div>
              </div>
            )}
          </el-dialog>
        </>
      );
    };

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    return (): JSX.Element => (
      <el-form-item
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
        class={`dockite-field-reference ${errors.value[name.value] ? 'is-error' : ''}`}
      >
        {getInputComponent()}

        {errors.value[name.value] && (
          <div class="el-form-item__error">{errors.value[name.value]}</div>
        )}

        <div class="el-form-item__description">{fieldConfig.value.description}</div>
      </el-form-item>
    );
  },
});

export default InputComponent;
