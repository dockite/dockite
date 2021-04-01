/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { groupBy, sortBy } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

import { Document, Schema } from '@dockite/database';
import { DockiteGraphQLSortInput, FindManyResult, UserContext } from '@dockite/types';

import { pathToColumn } from '../../../../common/util';
import { callLifeCycleHooks, LifecycleHook } from '../../../../common/util/callLifecycleHooks';

// This is required since the lodash captitalize method will lowercase the remainder of the string
const capitalize = (input: string): string => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};

/**
 * Provided a document and schema, process the document output by calling its associated field hooks.
 *
 * TODO: Remove references to `UserContext` type
 */
export const processDocumentOutput = async (
  document: Document,
  schema: Schema,
  user?: UserContext,
): Promise<void> => {
  // Organise the fields by their priorities so that depedencies can be called correctly
  const priorityGroups = groupBy(schema.fields, field => {
    return field.priority ?? 0;
  });

  // Retrieve the sorted keys for iterating against
  const groupKeys = sortBy(Object.keys(priorityGroups));

  // Then for each priority group
  for (const groupKey of groupKeys) {
    // Call the appropriate field hook
    await Promise.all(
      priorityGroups[groupKey].map(async field => {
        // If the field hasn't been assigned we will throw to abort early
        if (!field.dockiteField) {
          throw new Error(
            `Dockite field has not been assigned to ${field.title} of ${schema.title}`,
          );
        }

        if (!document.parentId) {
          // If the field doesn't hold any data we will assign a default value
          if (document.data[field.name] === undefined) {
            document.data[field.name] =
              field.settings.default ?? field.dockiteField.defaultValue() ?? null;
          }
        }

        if (document.data[field.name] === undefined) {
          // Finally call the process hook to update the documents data if required.
          document.data[field.name] = await field.dockiteField.processOutputRaw({
            data: { ...document.data, id: document.id },
            field,
            fieldData: document.data[field.name],
            user,
          });
        }
      }),
    );
  }
};

/**
 * Calls the given CRUD hooks handling the processors and validators when dealing with create/update actions.
 */
export const callCrudLifecycleHooks = async (
  type: 'create' | 'update' | 'softDelete' | 'permanentDelete',
  schema: Schema,
  data: Record<string, any>,
  document?: Document,
  oldData?: Record<string, any>,
): Promise<void> => {
  // If we're dealing with a mutating action then we will need to process and validate the input
  if (type === 'create' || type === 'update') {
    await callLifeCycleHooks({
      hook: 'processInputRaw',
      mutates: true,
      schema,
      data,
      document,
      oldData,
    });

    await callLifeCycleHooks({
      hook: 'validateInputRaw',
      schema,
      data,
      document,
      oldData,
    });
  }

  // Transform the current update type to a lifecycle hook
  // e.g. update -> onUpdate || permanentDelete -> onPermanentDelete
  const hook = `on${capitalize(type)}` as LifecycleHook;

  await callLifeCycleHooks({
    hook,
    schema,
    data,
    document,
    oldData,
  });
};

/**
 * Adds the desired sorting to the current query based on the provided Sort Input.
 */
export const addSortBy = (
  qb: SelectQueryBuilder<Document>,
  sort: DockiteGraphQLSortInput,
): void => {
  // This handle the case where typeorm can't add abritary orderBy's to a query
  // by adding the column to order by to the select column we can avoid breaking typeorm
  // and successfully get our results.
  if (sort.name.startsWith('data')) {
    qb.addSelect(`document.${pathToColumn(sort.name)}`, 'sorter');
    qb.orderBy('sorter', sort.direction);

    return;
  }

  if (sort.name.split('.').length > 0) {
    qb.addOrderBy(sort.name, sort.direction);

    return;
  }

  qb.addOrderBy(`document.${sort.name}`, sort.direction);
};

/**
 * Creates a find many result object from a given result and page count.
 */
export const createFindManyResult = <T>(
  result: T[],
  count: number,
  page: number,
  perPage: number,
): FindManyResult<T> => {
  const totalPages = Math.ceil(count / perPage);

  return {
    results: result,
    totalPages,
    totalItems: count,
    currentPage: page,
    hasNextPage: page < totalPages,
  };
};
