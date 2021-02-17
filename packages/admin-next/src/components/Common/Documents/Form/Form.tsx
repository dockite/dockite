import { Schema, Document, Field, Singleton } from '@dockite/database';
import { cloneDeep } from 'lodash';
import { defineComponent, computed, PropType, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getFieldsByGroup, getFieldComponent } from './util';

import { useDockite } from '~/dockite';
import { getInitialFormData } from '~/utils';

export interface DocumentFormComponentProps {
  modelValue: Record<string, any>;
  document: Document | Singleton;
  schema: Schema | Singleton;
  errors: Record<string, string>;
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
        <el-form label-position="top" model={formData.value}>
          <el-tabs v-model={selectedTab.value}>{fields}</el-tabs>
        </el-form>
      );
    };
  },
});

export default DocumentFormComponent;
