import {
  AndQuery,
  Constraint,
  OrQuery,
  PossibleConstraints,
} from '@dockite/where-builder/lib/types';

export const isOrQuery = (constraint: PossibleConstraints): constraint is OrQuery => {
  if (constraint && 'OR' in constraint) {
    return true;
  }

  return false;
};

export const isAndQuery = (constraint: PossibleConstraints): constraint is AndQuery => {
  if (constraint && 'AND' in constraint) {
    return true;
  }

  return false;
};

export const isConstraintItem = (constraint: PossibleConstraints): constraint is Constraint => {
  if (constraint && !isOrQuery(constraint) && !isAndQuery(constraint)) {
    return true;
  }

  return false;
};
