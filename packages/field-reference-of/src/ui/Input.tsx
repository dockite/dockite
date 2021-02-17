import { Document } from '@dockite/database';
import { DockiteFieldInputComponentProps, FindManyResult } from '@dockite/types';
import { computed, defineComponent, inject, onBeforeMount, PropType, ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';

import {
  DockiteFieldReferenceOfEntity,
  DocumentTableColumnDefaultScopedSlot,
  GraphQLResult,
  RESULTS_PER_PAGE,
} from '../types';

import {
  FindReferenceOfDocumentsQueryResponse,
  FIND_REFERENCE_OF_DOCUMENTS_QUERY,
} from './queries';
import { getPaginationString } from './util';

export type InputComponentProps = DockiteFieldInputComponentProps<
  null,
  DockiteFieldReferenceOfEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldReferenceOfInput',

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

  setup: props => {
    const $graphql = inject<any>('$graphql');
    const $message = inject<any>('$message');

    const { name, errors, fieldConfig } = toRefs(props);

    const documents = ref<FindManyResult<Document> | null>(null);

    const loading = ref(0);

    const route = useRoute();

    const results = computed<Document[]>(() => {
      if (documents.value) {
        return documents.value.results;
      }

      return [];
    });

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

    const fetchReferenceOfDocuments = async (page = 1): Promise<void> => {
      try {
        loading.value += 1;

        const {
          data,
        }: GraphQLResult<FindReferenceOfDocumentsQueryResponse> = await $graphql.executeQuery({
          query: FIND_REFERENCE_OF_DOCUMENTS_QUERY,
          variables: {
            page,
            perPage: RESULTS_PER_PAGE,
            documentId: route.query.documentId as string,
            schemaId: fieldConfig.value.settings.schemaId,
            fieldName: fieldConfig.value.settings.fieldName,
          },
        });

        if (data && data.referenceOfDocuments) {
          documents.value = data.referenceOfDocuments;
        }
      } catch {
        $message.error(`Unable to fetch documents for field "${fieldConfig.value.title}".`);
      } finally {
        loading.value -= 1;
      }
    };

    onBeforeMount(() => {
      if (route.query.documentId) {
        fetchReferenceOfDocuments();
      }
    });

    return () => {
      return (
        <>
          <el-form-item
            label={fieldConfig.value.title}
            prop={name.value}
            class={`dockite-field-reference-of ${errors.value[name.value] ? 'is-error' : ''}`}
          >
            {errors.value[name.value] && (
              <div class="el-form-item__error">{errors.value[name.value]}</div>
            )}

            <div class="border rounded mb-3" v-loading={loading.value > 0}>
              <el-table
                maxHeight={400}
                data={results.value}
                rowKey={(record: Document) => record.id}
              >
                <el-table-column prop="id" label="ID">
                  {{
                    default: (scope: DocumentTableColumnDefaultScopedSlot) => (
                      <router-link class="truncate" to={`/documents/${scope.row.id}`}>
                        {scope.row.id}
                      </router-link>
                    ),
                  }}
                </el-table-column>

                <el-table-column label="Identifier">
                  {{
                    default: (scope: DocumentTableColumnDefaultScopedSlot) => (
                      <span>{getIdentifier(scope.row)}</span>
                    ),
                  }}
                </el-table-column>
              </el-table>

              <div class="flex justify-between items-center py-3">
                <span>{documents.value && getPaginationString(documents.value)}</span>

                <el-pagination
                  currentPage={documents.value?.currentPage || 1}
                  pageSize={RESULTS_PER_PAGE}
                  layout="prev, pager, next"
                  pageCount={documents.value?.totalPages || 0}
                  onCurrentChange={(newPage: number) => {
                    fetchReferenceOfDocuments(newPage);
                  }}
                />
              </div>
            </div>

            <div class="el-form-item__description">{fieldConfig.value.description}</div>
          </el-form-item>
        </>
      );
    };
  },
});
