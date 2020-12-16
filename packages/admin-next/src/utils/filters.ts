import { RouteLocation } from 'vue-router';

import {
  DockiteGraphqlSortInput as DockiteGraphQLSortInput,
  DockiteSortDirection,
} from '@dockite/types';
import { Constraint, ConstraintOperator, AndQuery } from '@dockite/where-builder';

import { Nullable, Maybe } from '~/common/types';

export const getAppliedFilters = (route: RouteLocation): Record<string, Nullable<Constraint>> => {
  const { filters } = route.query;

  const constraints: Record<string, Nullable<Constraint>> = {};

  if (!filters) {
    return constraints;
  }

  if (Array.isArray(filters)) {
    filters.forEach(queryParam => {
      if (typeof queryParam !== 'string') {
        return;
      }

      const [name, operator, value] = queryParam.split('|');

      if (!name || !operator || !value) {
        return;
      }

      constraints[name] = { name, operator: operator as ConstraintOperator, value };
    });
  } else {
    if (typeof filters !== 'string') {
      return constraints;
    }

    const [name, operator, value] = filters.split('|');

    if (!name || !operator || !value) {
      return constraints;
    }

    constraints[name] = {
      name,
      operator: operator as ConstraintOperator,
      value,
    };
  }

  return constraints;
};

export const getFiltersFromTableState = (
  filters: Record<string, Nullable<Constraint>>,
): Maybe<AndQuery> => {
  const constraints = Object.values(filters).filter(f => !!f) as Constraint[];

  if (constraints.length > 0) {
    return { AND: constraints };
  }

  return undefined;
};

export const transformFiltersToQueryParam = (filters: Maybe<AndQuery>): string[] | undefined => {
  if (!filters) {
    return undefined;
  }

  return filters.AND.map(filter => {
    if ('AND' in filter || 'OR' in filter) {
      return undefined;
    }

    return `${filter.name}|${filter.operator}|${filter.value}`;
  }).filter(f => !!f) as string[];
};

export const getAppliedSort = (route: RouteLocation): DockiteGraphQLSortInput | undefined => {
  if (!route.query.sortBy) {
    return undefined;
  }

  if (typeof route.query.sortBy !== 'string') {
    return undefined;
  }

  const [name, direction] = route.query.sortBy.split('|');

  return {
    name,
    direction:
      direction.toUpperCase() === DockiteSortDirection.DESC
        ? DockiteSortDirection.DESC
        : DockiteSortDirection.ASC,
  };
};
