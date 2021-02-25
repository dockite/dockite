/* eslint-disable no-param-reassign */
import { cloneDeep } from 'lodash';
import { computed, Ref } from 'vue';

import {
  SchemaGridViewSettings,
  SchemaTableViewSettings,
  SchemaTreeViewSettings,
} from '@dockite/database';

import { gridViewFormRules, tableViewFormRules, treeViewFormRules } from './formRules';
import { SchemaViewConfigurationComponentProps } from './types';

import { BaseSchema } from '~/common/types';

export const BASE_TABLE_VIEW_SETTINGS: SchemaTableViewSettings = {
  fieldsToDisplay: [],
  defaultOrderBy: {
    column: 'updatedAt',
    direction: 'DESC',
  },
};

export const BASE_TREE_VIEW_SETTINGS: SchemaTreeViewSettings = {
  labelField: '',
  parentField: '',
  sortField: '',
};

export const BASE_GRID_VIEW_SETTINGS: SchemaGridViewSettings = {
  labelField: '',
  imageField: '',
  fieldsToDisplay: [],
  defaultOrderBy: {
    column: 'updatedAt',
    direction: 'DESC',
  },
};

export const getTableViewSettingsForm = (
  modelValue: Ref<SchemaViewConfigurationComponentProps['modelValue']>,
  schema: BaseSchema,
  _schemaType: string,
): JSX.Element => {
  // Create a new computed property for accessing the settings to infer type information.
  const settings = computed({
    get: () => modelValue.value.settings as SchemaTableViewSettings,
    set: value => {
      modelValue.value.settings = value;
    },
  });

  if (!settings.value) {
    settings.value = cloneDeep(BASE_TABLE_VIEW_SETTINGS);
  }

  // settings.value = {
  //   ...cloneDeep(BASE_TABLE_VIEW_SETTINGS),
  //   ...settings.value,
  // };

  return (
    <div>
      <el-form-item
        label="Fields to Display"
        prop="settings.fieldsToDisplay"
        rules={tableViewFormRules.fieldsToDisplay}
      >
        <el-select v-model={settings.value.fieldsToDisplay} class="w-full" multiple filterable>
          {schema.fields.map(field => (
            <el-option label={field.title} value={field.name} />
          ))}
        </el-select>

        <div class="el-form-item__description">
          The fields to be displayed as columns within the table view. The displayed columns can
          also be changed by the user on the table view.
        </div>
      </el-form-item>

      {settings.value.defaultOrderBy && (
        <div>
          <el-form-item
            label="Default Ordering Column"
            prop="settings.defaultOrderBy.column"
            rules={tableViewFormRules.defaultOrderBy.column}
          >
            <el-select v-model={settings.value.defaultOrderBy.column} class="w-full" filterable>
              <el-option label="Document Created Time" value="createdAt" />

              <el-option label="Document Updated Time" value="updatedAt" />

              {schema.fields.map(field => (
                <el-option label={field.title} value={`data.${field.name}`} />
              ))}
            </el-select>

            <div class="el-form-item__description">
              The column to be used for the ordering of documents. This can be changed by the user
              on the table view.
            </div>
          </el-form-item>

          <el-form-item
            label="Default Ordering Direction"
            prop="settings.defaultOrderBy.direction"
            rules={tableViewFormRules.defaultOrderBy.direction}
          >
            <el-select v-model={settings.value.defaultOrderBy.direction} class="w-full">
              <el-option label="Ascending" value="ASC" />

              <el-option label="Descending" value="DESC" />
            </el-select>

            <div class="el-form-item__description">
              The ordering direction to be used. This can be changed by the user on the table view.
            </div>
          </el-form-item>
        </div>
      )}
    </div>
  );
};

export const getTreeViewSettingsForm = (
  modelValue: Ref<SchemaViewConfigurationComponentProps['modelValue']>,
  schema: BaseSchema,
  schemaType: string,
): JSX.Element => {
  // Create a new computed property for accessing the settings to infer type information.
  const settings = computed({
    get: () => modelValue.value.settings as SchemaTreeViewSettings,
    set: value => {
      modelValue.value.settings = value;
    },
  });

  if (!settings.value) {
    settings.value = cloneDeep(BASE_TREE_VIEW_SETTINGS);
  }

  // settings.value = {
  //   ...cloneDeep(BASE_TREE_VIEW_SETTINGS),
  //   ...settings.value,
  // };

  return (
    <div>
      <el-form-item
        label="Label Field"
        prop="settings.labelField"
        rules={treeViewFormRules.labelField}
      >
        <el-select v-model={settings.value.labelField} class="w-full" filterable>
          {schema.fields.map(field => (
            <el-option label={field.title} value={field.name} />
          ))}
        </el-select>

        <div class="el-form-item__description">
          The field to be displayed as the label for a tree view item.
        </div>
      </el-form-item>

      <el-form-item
        label="Parent Field"
        prop="settings.parentField"
        rules={treeViewFormRules.parentField}
      >
        <el-select v-model={settings.value.parentField} class="w-full" filterable>
          {/* Filter out fields that don't include `reference` in their type */}
          {schema.fields
            .filter(field => field.type.toLowerCase().includes('reference'))
            .map(field => (
              <el-option label={field.title} value={field.name} />
            ))}
        </el-select>

        <div class="el-form-item__description">
          The field to be used for building the parent-child relationship between documents. This
          should only reference documents within the same {schemaType} to avoid issues.
        </div>
      </el-form-item>

      <el-form-item label="Sort Field" prop="settings.sortField">
        <el-select v-model={settings.value.sortField} class="w-full" filterable clearable>
          {/* Filter out fields that don't include `sort` in their type */}
          {schema.fields
            .filter(field => field.type.toLowerCase().includes('sort'))
            .map(field => (
              <el-option label={field.title} value={field.name} />
            ))}
        </el-select>

        <div class="el-form-item__description">
          The field to be used for the consistent ordering of tree items. If not supplied tree item
          ordering cannot be guaranteed.
        </div>
      </el-form-item>
    </div>
  );
};

export const getGridViewSettingsForm = (
  modelValue: Ref<SchemaViewConfigurationComponentProps['modelValue']>,
  schema: BaseSchema,
  _schemaType: string,
): JSX.Element => {
  // Create a new computed property for accessing the settings to infer type information.
  const settings = computed({
    get: () => modelValue.value.settings as SchemaGridViewSettings,
    set: value => {
      modelValue.value.settings = value;
    },
  });

  if (!settings.value) {
    settings.value = cloneDeep(BASE_GRID_VIEW_SETTINGS);
  }

  // settings.value = {
  //   ...cloneDeep(BASE_GRID_VIEW_SETTINGS),
  //   ...settings.value,
  // };

  return (
    <div>
      <el-form-item
        label="Label Field"
        prop="settings.labelField"
        rules={gridViewFormRules.labelField}
      >
        <el-select v-model={settings.value.labelField} class="w-full" filterable>
          {schema.fields.map(field => (
            <el-option label={field.title} value={field.name} />
          ))}
        </el-select>

        <div class="el-form-item__description">
          The field to be displayed as the label for a grid view item.
        </div>
      </el-form-item>

      <el-form-item
        label="Image Field"
        prop="settings.imageField"
        rules={gridViewFormRules.imageField}
      >
        <el-select v-model={settings.value.imageField} class="w-full" filterable>
          {/* Filter out fields that don't include `image` in their type */}
          {schema.fields
            .filter(field => field.type.toLowerCase().includes('image'))
            .map(field => (
              <el-option label={field.title} value={field.name} />
            ))}
        </el-select>

        <div class="el-form-item__description">
          The image field to be displayed as the image for a grid view item. This will use the
          field's field-level view.
        </div>
      </el-form-item>

      <el-form-item
        label="Fields to Display"
        prop="settings.fieldsToDisplay"
        rules={gridViewFormRules.fieldsToDisplay}
      >
        <el-select v-model={settings.value.fieldsToDisplay} class="w-full" multiple filterable>
          {schema.fields.map(field => (
            <el-option label={field.title} value={field.name} />
          ))}
        </el-select>

        <div class="el-form-item__description">
          The additional fields to be displayed under the label in a key-value format.
        </div>
      </el-form-item>

      {settings.value.defaultOrderBy && (
        <div>
          <el-form-item
            label="Default Ordering Column"
            prop="settings.defaultOrderBy.column"
            rules={gridViewFormRules.defaultOrderBy.column}
          >
            <el-select v-model={settings.value.defaultOrderBy.column} class="w-full" filterable>
              <el-option label="Document Created Time" value="createdAt" />

              <el-option label="Document Updated Time" value="updatedAt" />

              {schema.fields.map(field => (
                <el-option label={field.title} value={`data.${field.name}`} />
              ))}
            </el-select>

            <div class="el-form-item__description">
              The column to be used for the ordering of documents. This cannot be changed by the
              user on the grid view.
            </div>
          </el-form-item>

          <el-form-item
            label="Default Ordering Direction"
            prop="settings.defaultOrderBy.direction"
            rules={gridViewFormRules.defaultOrderBy.direction}
          >
            <el-select v-model={settings.value.defaultOrderBy.direction} class="w-full">
              <el-option label="Ascending" value="ASC" />

              <el-option label="Descending" value="DESC" />
            </el-select>

            <div class="el-form-item__description">
              The ordering direction to be used. This cannot be changed by the user on the grid
              view.
            </div>
          </el-form-item>
        </div>
      )}
    </div>
  );
};

export const getViewSettingsForm = (
  modelValue: Ref<SchemaViewConfigurationComponentProps['modelValue']>,
  schema: BaseSchema,
  schemaType: string,
): JSX.Element => {
  switch (modelValue.value.type) {
    case 'table':
      return getTableViewSettingsForm(modelValue, schema, schemaType);

    case 'tree':
      return getTreeViewSettingsForm(modelValue, schema, schemaType);

    case 'grid':
      return getGridViewSettingsForm(modelValue, schema, schemaType);

    default:
      return (
        <el-alert title="View Type is not configured" type="error" showIcon closable={false}>
          The view type has not been configured. We are unable to display the settings form for the
          current view item.
        </el-alert>
      );
  }
};
