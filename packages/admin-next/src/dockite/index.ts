import { DefineComponent, reactive, ref, Ref, Plugin } from 'vue';

import { Field, Schema } from '@dockite/database';
import { DockiteFieldInputComponentProps } from '@dockite/types';

import { importDockiteFields } from './fields';

import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { Nullable } from '~/common/types';

const w = window as any;

interface FieldComponentProps {
  name: string;
  formData: Record<string, any>;
  schema?: Schema;
  fieldConfig: Field;
  errors: any;
}

interface FieldManagerItem {
  input: Nullable<DefineComponent<DockiteFieldInputComponentProps<any, any>>>;
  settings: Nullable<DefineComponent<FieldComponentProps>>;
  view: Nullable<DefineComponent<FieldComponentProps>>;
}

const fieldManager: Record<string, FieldManagerItem> = reactive({});

const hasLoadedFields = ref(false);

const registerField = (
  name: string,
  input: Nullable<DefineComponent<DockiteFieldInputComponentProps<any, any>>>,
  settings: Nullable<DefineComponent<FieldComponentProps>>,
  view: Nullable<DefineComponent<FieldComponentProps>> = null,
): void => {
  if (fieldManager[name]) {
    throw new ApplicationError(
      `Field naming clash, field with name "${name}" has already been registered`,
      ApplicationErrorCode.FIELD_REGISTERED,
    );
  }

  fieldManager[name] = {
    input,
    settings,
    view,
  };
};

export const bootstrapDockite = (): void => {
  if (!w.dockite) {
    w.dockite = {
      registerField,
      fieldManager,
    };
  }

  importDockiteFields().then(() => {
    hasLoadedFields.value = true;
  });
};

export interface UseDockiteHook {
  fieldManager: typeof fieldManager;
  hasLoadedFields: Ref<boolean>;
}

export const useDockite = (): UseDockiteHook => {
  return { fieldManager, hasLoadedFields };
};

export const DockiteVuePlugin: Plugin = app => {
  // eslint-disable-next-line no-param-reassign
  app.config.globalProperties.$dockite = { hasLoadedFields, fieldManager };
};
