/* eslint-disable no-param-reassign */
import { BaseField } from '@dockite/database';
import { ElMessage, ElMessageBox } from 'element-plus';
import { omit } from 'lodash';
import { Ref } from 'vue';

import { BaseSchema } from '~/common/types';

export const handleAddGroup = async (
  schemaRef: Ref<BaseSchema>,
  activeTabRef: Ref<string>,
  groups: Record<string, string[]>,
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
      if (Object.keys(groups).some(group => group.toLowerCase() === value.toLowerCase())) {
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
    Object.assign(schemaRef.value.groups, {
      [result.value]: [],
    });

    activeTabRef.value = result.value;
  }
};

export const handleRemoveGroup = async (
  groupName: string,
  schemaRef: Ref<BaseSchema>,
  activeTabRef: Ref<string>,
  groups: Record<string, string[]>,
): Promise<void> => {
  if (Object.keys(groups).length <= 1) {
    ElMessage.warning('There must be at least one group');

    return;
  }

  if (!groups[groupName]) {
    ElMessage.error('Group to be removed does not exist');

    return;
  }

  const result = await ElMessageBox.confirm(
    `This will also remove ${groups[groupName].length} fields. Are you sure you want to continue?`,
    'Confirm Group Deletion',
    {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    },
  ).catch(() => undefined);

  if (result) {
    // Shallow clone the field names for removal
    const fieldNames = [...groups[groupName]];

    // Omit the group to removed from the current groups object
    schemaRef.value.groups = omit(groups, groupName);

    // Omit any fields that belonged to the group from the schema
    schemaRef.value.fields = schemaRef.value.fields.filter(
      field => !fieldNames.includes(field.name),
    );

    // If we're currently on the tab for the group, change to the first available tab
    if (activeTabRef.value === groupName) {
      [activeTabRef.value] = Object.keys(schemaRef.value.groups);
    }
  }
};

// TODO: Annotate the type for this one.
export const getFieldTreeForGroup = (groupFields: string[], fields: BaseField[]): any => {
  const filteredFields = fields.filter(field => groupFields.includes(field.name));

  return filteredFields;
};
