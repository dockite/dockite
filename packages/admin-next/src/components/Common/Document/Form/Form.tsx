import { cloneDeep } from 'lodash';
import { computed, defineComponent, PropType, reactive, Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Field, Schema, Singleton } from '@dockite/database';

import { getFieldComponent } from './util';

import { BaseDocument } from '~/common/types';
import { useDockite } from '~/dockite';
import { getFieldsByGroup, getInitialFormData } from '~/utils';

export interface DocumentFormComponentProps {
  modelValue: Record<string, any>;
  document: BaseDocument | Singleton;
  schema: Schema | Singleton;
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

    Object.assign(formData.value, getInitialFormData(props.document, props.schema));

    if (route.query.tab && typeof route.query.tab === 'string') {
      const tab = route.query.tab.toLowerCase();

      if (availableTabSelections.value.includes(tab)) {
        selectedTab.value = tab;
      }
    }

    if (selectedTab.value === null) {
      [selectedTab.value] = availableTabSelections.value;
    }

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
              {fields.map(field =>
                getFieldComponent(
                  field,
                  props.schema,
                  formData.value,
                  reactiveGroups,
                  props.errors,
                ),
              )}
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
