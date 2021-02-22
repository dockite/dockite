/* eslint-disable no-param-reassign */
import { BaseField } from '@dockite/database';
import { ElMessage, ElMessageBox } from 'element-plus';
import { omit } from 'lodash';
import { Ref } from 'vue';

import { FieldTreeItem } from './types';

/**
 * Handles the addition of a group to the current schema field tree with validation of input.
 *
 * @param schemaFieldTreeRef The schema field tree reference
 * @param activeTabRef The active tab reference
 */
export const handleAddGroup = async (
  schemaFieldTreeRef: Ref<Record<string, FieldTreeItem[]>>,
  activeTabRef: Ref<string>,
): Promise<void> => {
  const result = await ElMessageBox.prompt('Group Name', 'Add a Group', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',

    inputValidator: (value: string) => {
      // The validator checks that the first character is a letter which is then subsequently followed by:
      // letters, numbers, underscores, hypens or spaces.
      const re = /^[A-Za-z][A-Za-z0-9_-\s]*$/;

      // Check if the group name has been provided
      if (value.length === 0) {
        return 'Group name is required';
      }

      // Check if the group name has already been used
      if (
        Object.keys(schemaFieldTreeRef.value).some(
          group => group.toLowerCase() === value.toLowerCase(),
        )
      ) {
        return 'Group name has already been used';
      }

      // Check if the group name contains only valid characters
      if (!re.test(value)) {
        return 'Group name must only contain the following: letters, numbers, underscores, hypens and spaces';
      }

      return true;
    },
  }).catch(() => undefined);

  if (result && result.value) {
    Object.assign(schemaFieldTreeRef.value, {
      [result.value]: [],
    });

    activeTabRef.value = result.value;
  }
};

/**
 * Handle the removal of a group from the schema field tree.
 * Additionally prompts for confirmation to avoid misclicks causing massive loss of data.
 *
 * @param groupName The group to be removed
 * @param schemaFieldTreeRef The schema field tree reference
 * @param activeTabRef The active tab reference
 */
export const handleRemoveGroup = async (
  groupName: string,
  schemaFieldTreeRef: Ref<Record<string, FieldTreeItem[]>>,
  activeTabRef: Ref<string>,
): Promise<void> => {
  if (Object.keys(schemaFieldTreeRef.value).length <= 1) {
    ElMessage.warning('There must be at least one group');

    return;
  }

  if (!schemaFieldTreeRef.value[groupName]) {
    ElMessage.error('Group to be removed does not exist');

    return;
  }

  const result = await ElMessageBox.confirm(
    `This will also remove ${schemaFieldTreeRef.value[groupName].length} fields. Are you sure you want to continue?`,
    'Confirm Group Deletion',
    {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    },
  ).catch(() => undefined);

  if (result) {
    // Omit the group from the current field tree
    schemaFieldTreeRef.value = omit(schemaFieldTreeRef.value, groupName);

    // If we're currently on the tab for the group, change to the first available tab
    if (activeTabRef.value === groupName) {
      [activeTabRef.value] = Object.keys(schemaFieldTreeRef.value.groups);
    }
  }
};

/**
 * Walks the current schemas fields to build a tree structure for use with the ElTree component.
 *
 * @param fields The current schemas fields
 */
export const buildSchemaFieldTree = (fields: BaseField[]): FieldTreeItem[] => {
  return fields.map(field => {
    const item: FieldTreeItem = {
      title: field.title,
      type: field.type,
      _field: field,
    };

    if ('children' in field.settings && Array.isArray(field.settings.children)) {
      item.children = buildSchemaFieldTree(field.settings.children);
    }

    return item;
  });
};

export const getFieldsFromSchemaFieldTree = (schemaFieldTree: FieldTreeItem[]): BaseField[] => {
  return schemaFieldTree.map(treeItem => {
    const { _field: field } = treeItem;

    if (treeItem.children) {
      field.settings.children = getFieldsFromSchemaFieldTree(treeItem.children);
    }

    return field;
  });
};
