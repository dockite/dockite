import { flatMap, uniq } from 'lodash';
import { Router } from 'vue-router';

import { FieldErrorList } from '~/common/types';

export const getHeaderActions = (createDocumentHandler: () => any): JSX.Element => {
  return (
    <el-dropdown splitButton onClick={() => createDocumentHandler()}>
      {{
        default: () => <span>Create and Publish</span>,

        dropdown: () => (
          <el-dropdown-menu>
            <el-dropdown-item>Something</el-dropdown-item>
          </el-dropdown-menu>
        ),
      }}
    </el-dropdown>
  );
};

export const getFooter = (router: Router): JSX.Element => {
  return (
    <div class="pt-3">
      <el-button type="text" onClick={() => router.back()}>
        Go Back
      </el-button>
    </div>
  );
};

export const getFormFieldIdentifiers = (formData: Record<string, any>, prefix = ''): string[] => {
  const identifiers: string[] = [];

  Object.keys(formData).forEach(key => {
    // If we're dealing with an Array, iterate over the keys collecting further identifiers
    if (formData[key] !== null && Array.isArray(formData[key])) {
      identifiers.push(
        ...flatMap(formData[key], (value, index) =>
          getFormFieldIdentifiers(value as Record<string, any>, `${prefix}${key}[${index}]`),
        ),
      );
      // Otherwise if it's an object, iterate over the values collecting additional keys
    } else if (formData[key] !== null && typeof formData[key] === 'object') {
      identifiers.push(
        ...flatMap(Object.values(formData[key]), value =>
          getFormFieldIdentifiers(value as Record<string, any>, `${prefix}${key}.`),
        ),
      );
    }

    // Finally add the current identifier
    identifiers.push(`${prefix}${key}`);
  });

  return uniq(identifiers);
};

/**
 * Provided a form component reference and a set of a fields to validate, validate each field and then
 * resolve to `true` if no errors were encountered.
 *
 * @param formRef The reference to the form component taken from vue
 * @param fieldsToValidate The list of fields to validate using their form identifiers
 *
 * @throws {FieldErrorList} An object containing the identifier for each field that has an error
 * and an array of error messages for the given field
 */
export const validateFields = async (formRef: any, fieldsToValidate: string[]): Promise<true> => {
  // Construct an object containing any fields that have errors with their form data
  const errors: FieldErrorList = {};

  await Promise.all(
    // Then for every field construct a new promise to resolve the validationResult which is kept within a callback
    fieldsToValidate.map(
      fieldToValidate =>
        // The promise will always resolve with errors being added to the root object in the background
        new Promise<void>(resolve => {
          formRef.validateField(
            fieldToValidate,
            (_: never, invalidFields: FieldErrorList): void => {
              // If there are any invalid fields we will concatenate them with the root errors object
              if (invalidFields) {
                Object.assign(errors, invalidFields);
              }

              return resolve();
            },
          );
        }),
    ),
  );

  // If there are any items within our errors object we want to throw it to match the current
  // element-plus method of doing things
  if (Object.keys(errors).length > 0) {
    throw errors;
  }

  return true;
};
