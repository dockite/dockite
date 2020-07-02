import { WhereExpression } from 'typeorm';

export const SupportedOperators = [
  '$eq',
  '$ne',
  '$gt',
  '$gt_date',
  '$gte',
  '$gte_date',
  '$lt',
  '$lt_date',
  '$lte',
  '$lte_date',
  '$like',
  '$ilike',
  '$regex',
  '$array_contains',
  '$null',
  '$not_null',
] as const;

export type ConstraintOperator = typeof SupportedOperators[number];

export type ConstraintHandlerFn = (qb: WhereExpression, constraint: Constraint) => void;

export interface Constraint {
  name: string;
  operator: ConstraintOperator;
  value: string;
}

export type PossibleConstraints = Constraint | OrQuery | AndQuery;

export type ConstraintArray = Array<PossibleConstraints>;

export interface OrQuery {
  OR: ConstraintArray;
}

export interface AndQuery {
  AND: ConstraintArray;
}

export type QueryBuilder = OrQuery | AndQuery;
