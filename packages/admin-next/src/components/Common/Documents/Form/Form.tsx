import { cloneDeep } from 'lodash';
import { defineComponent, computed, PropType, reactive } from 'vue';

import { Schema, Document, Field } from '@dockite/database';

import { getFieldsByGroup, getFieldComponent } from './util';

import { useDockite } from '~/dockite';
import { getInitialFormData } from '~/utils';

export interface DocumentFormComponentProps {
  formData: Record<string, any>;
  document: Document;
  schema: Schema;
  errors: Record<string, string>;
}

export const DocumentFormComponent = defineComponent({
  name: 'DocumentFormComponent',
  props: {
    modelValue: {
      type: Object as PropType<DocumentFormComponentProps['formData']>,
      required: true,
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
    const formData = computed<Record<string, any>>({
      get: () => props.modelValue,
      set: value => ctx.emit('update:modelValue', value),
    });

    Object.assign(formData.value, getInitialFormData(props.document, props.schema));

    const groups = props.schema.groups as Record<string, string[]>;

    const groupsModel = reactive({ ...cloneDeep(groups) });

    const mappedGroups: Record<string, Field[]> = Object.keys(groups).reduce((acc, curr) => {
      return { ...acc, [curr]: getFieldsByGroup(curr, props.schema) };
    }, {});

    const { hasLoadedFields } = useDockite();

    return () => {
      if (!hasLoadedFields.value) {
        return <span>Fields are still loading, please wait...</span>;
      }

      if (!props.schema || !props.document) {
        return <div>Schema or Document not provided</div>;
      }

      const fields = Object.entries(mappedGroups).map(
        ([name, fields]): JSX.Element => (
          <el-tab-pane label={name}>
            <div>
              {fields.map(field =>
                getFieldComponent(field, props.schema, formData.value, groupsModel, props.errors),
              )}
            </div>
          </el-tab-pane>
        ),
      );

      return (
        <el-form model={formData.value}>
          <el-tabs>{fields}</el-tabs>
        </el-form>
      );
    };
  },
});

export default DocumentFormComponent;
