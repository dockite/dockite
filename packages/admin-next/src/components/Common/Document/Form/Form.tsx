import { cloneDeep, omit } from 'lodash';
import { computed, defineComponent, PropType, reactive, Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Document, Field, Schema, Singleton } from '@dockite/database';

import { RenderIfComponent } from '../../RenderIf';

import { FormFieldComponent } from './Field';

import { BaseDocument } from '~/common/types';
import { useDockite } from '~/dockite';
import { getDocumentIdentifier, getFieldsByGroup, getInitialFormData } from '~/utils';

export interface DocumentFormComponentProps {
  modelValue: Record<string, any>;
  document: BaseDocument | Singleton;
  schema: Schema | Singleton;
  parent: Document | null;
  errors: Record<string, string>;
  formRef?: Ref<any>;
}

export const DocumentFormComponent = defineComponent({
  name: 'DocumentFormComponent',

  props: {
    modelValue: {
      type: Object as PropType<DocumentFormComponentProps['modelValue']>,
    },

    document: {
      type: Object as PropType<DocumentFormComponentProps['document']>,
      required: true,
    },

    parent: {
      type: Object as PropType<DocumentFormComponentProps['parent']>,
      required: false,
    },

    schema: {
      type: Object as PropType<DocumentFormComponentProps['schema']>,
      required: true,
    },

    errors: {
      type: Object as PropType<DocumentFormComponentProps['errors']>,
      required: true,
    },

    formRef: {
      type: (null as any) as PropType<DocumentFormComponentProps['formRef']>,
    },
  },

  setup: (props, ctx) => {
    const formData = computed({
      get: () => props.modelValue as DocumentFormComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const parentData = computed(() => {
      if (props.parent) {
        return getInitialFormData(props.parent, props.schema);
      }

      return null;
    });

    const selectedTab = ref<string | null>(null);

    const route = useRoute();

    const router = useRouter();

    const { hasLoadedFields } = useDockite();

    const reactiveGroups = reactive<Record<string, string[]>>({
      ...cloneDeep(props.schema.groups),
    });

    const groupsWithFields = computed<Record<string, Field[]>>(() =>
      Object.keys(reactiveGroups).reduce((acc, curr) => {
        return {
          ...acc,
          [curr]: getFieldsByGroup(curr, props.schema),
        };
      }, {}),
    );

    const availableTabSelections = computed(() =>
      Object.keys(reactiveGroups).map(group => group.toLowerCase()),
    );

    if (!props.parent) {
      Object.assign(formData.value, getInitialFormData(props.document, props.schema));
    } else {
      Object.assign(formData.value, props.document.data);
    }

    if (route.query.tab && typeof route.query.tab === 'string') {
      const tab = route.query.tab.toLowerCase();

      if (availableTabSelections.value.includes(tab)) {
        selectedTab.value = tab;
      }
    }

    if (selectedTab.value === null) {
      [selectedTab.value] = availableTabSelections.value;
    }

    const handleToggleField = (field: Field, value: boolean): void => {
      if (value) {
        formData.value[field.name] = formData.value[field.name] ?? field.settings.default ?? null;
      } else {
        formData.value = omit(formData.value, field.name);
      }
    };

    watch(selectedTab, value => {
      router.replace({
        query: {
          ...route.query,
          tab: value,
        },
      });
    });

    return () => {
      if (!hasLoadedFields.value) {
        return <span>Fields are still loading, please wait...</span>;
      }

      if (!props.schema || !props.document) {
        return <div>Schema or Document not provided</div>;
      }

      const fields = Object.entries(groupsWithFields.value).map(
        ([name, fields]): JSX.Element => (
          <el-tab-pane name={name.toLowerCase()} label={name}>
            <div>
              {fields.map(field => (
                <>
                  <RenderIfComponent condition={!props.parent}>
                    <FormFieldComponent
                      field={field}
                      schema={props.schema}
                      formData={formData.value}
                      groups={reactiveGroups}
                      errors={props.errors}
                    />
                  </RenderIfComponent>

                  <RenderIfComponent condition={!!props.parent}>
                    <div class="flex justify-between items-center w-full -mx-3">
                      <div class="flex-1 relative px-3">
                        <div class="relative">
                          <div
                            class={{
                              'absolute h-full w-full top-0 left-0': true,
                              hidden: formData.value[field.name] !== undefined,
                            }}
                            style={{ zIndex: 100 }}
                          >
                            <div class="h-full w-full bg-black opacity-50 p-3 rounded text-center text-white text-sm flex items-center justify-center">
                              <i class="el-icon-lock" />

                              <span class="px-2">
                                Value inherited from{' '}
                                {getDocumentIdentifier(parentData.value!, props.parent!)}
                              </span>
                            </div>
                          </div>

                          <RenderIfComponent condition={formData.value[field.name] !== undefined}>
                            <FormFieldComponent
                              field={field}
                              schema={props.schema}
                              formData={formData.value}
                              groups={reactiveGroups}
                              errors={props.errors}
                            />
                          </RenderIfComponent>

                          <RenderIfComponent
                            condition={formData.value[field.name] === undefined && !!props.parent}
                          >
                            <div class="mx-3 mb-3 py-2">
                              <FormFieldComponent
                                field={field}
                                schema={props.schema}
                                formData={{}}
                                groups={reactiveGroups}
                                errors={props.errors}
                              />
                            </div>
                          </RenderIfComponent>
                        </div>
                      </div>

                      <div class="px-3">
                        <el-switch
                          value={formData.value[field.name] !== undefined}
                          onInput={(value: boolean) => handleToggleField(field, value)}
                        />
                      </div>
                    </div>
                  </RenderIfComponent>
                </>
              ))}
            </div>
          </el-tab-pane>
        ),
      );

      return (
        <el-form label-position="top" model={formData.value} ref={props.formRef}>
          <el-tabs v-model={selectedTab.value}>{fields}</el-tabs>
        </el-form>
      );
    };
  },
});

export default DocumentFormComponent;
