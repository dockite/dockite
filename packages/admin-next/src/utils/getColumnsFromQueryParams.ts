import { RouteLocation } from 'vue-router';

import { Schema } from '@dockite/database';

import { DocumentTableColumn } from '~/components/Common/Document/Table/types';

/**
 *
 */
export const getColumnsFromQueryParams = (
  route: RouteLocation,
  schema: Schema,
): DocumentTableColumn[] => {
  const columns: DocumentTableColumn[] = [];

  if (route.query.columns) {
    const routeColumns = Array.isArray(route.query.columns)
      ? route.query.columns
      : [route.query.columns];

    routeColumns.forEach(column => {
      if (typeof column === 'string') {
        const field = schema.fields.find(field => field.name === column);

        if (field) {
          columns.push({
            name: field.name,
            label: field.title,
            filterable: true,
          });
        }
      }
    });

    return columns;
  }

  return [];
};

export default getColumnsFromQueryParams;
