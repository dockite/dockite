import { BaseField, Field, Schema } from '@dockite/database';
import { ElMessage, ElNotification } from 'element-plus';
import { DefineComponent, Plugin, reactive, ref, Ref } from 'vue';

import {
  DockiteFieldInputComponentProps,
  DockiteFieldSettingsComponentProps,
  DockiteFieldViewComponentProps,
} from '@dockite/types';

import { importDockiteFields } from './fields';

import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { BaseSchema, Nullable } from '~/common/types';
import { useGraphQL } from '~/hooks';

const w = window as any;

interface FieldManagerItem {
  input: Nullable<DefineComponent<DockiteFieldInputComponentProps<any, any>>>;
  settings: Nullable<DefineComponent<DockiteFieldSettingsComponentProps<BaseField, BaseSchema>>>;
  view: Nullable<DefineComponent<DockiteFieldViewComponentProps<BaseField>>>;
}

const fieldManager: Record<string, FieldManagerItem> = reactive({});

const hasLoadedFields = ref(false);

const registerField = (
  name: string,
  input: FieldManagerItem['input'],
  settings: FieldManagerItem['settings'],
  view: FieldManagerItem['view'] = null,
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
  return { hasLoadedFields, fieldManager };
};

export const DockiteVuePlugin: Plugin = app => {
  // eslint-disable-next-line no-param-reassign
  app.config.globalProperties.$dockite = { hasLoadedFields, fieldManager };

  const $graphql = useGraphQL();

  app.provide('$graphql', $graphql);

  app.provide('$dockite', { hasLoadedFields, fieldManager });
  app.provide('$message', ElMessage);
  app.provide('$notify', ElNotification);
};
