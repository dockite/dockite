/* eslint-disable @typescript-eslint/camelcase */
import { WhereExpression } from 'typeorm';

export const Operators = {
  $ilike: 'Checks for a value containing the input provided (case-insensitive)',
  $like: 'Checks for a value containing the input provided (case-sensitive)',
  $eq: 'Checks for a value is the same as the input provided',
  $ne: 'Checks for a value that is not the same as the input provided',
  $in: 'Checks for a value that is within the input provided',
  $gt: 'Checks for a value that is greater than the input provided',
  $gt_date: 'Checks for a date that is greater than the date provided',
  $gte: 'Checks for a value that is greater than or equal to the input provided',
  $gte_date: 'Checks for a date that is greater than the date provided',
  $lt: 'Checks for a value that is less than the input provided',
  $lt_date: 'Checks for a date that is less than the date provided',
  $lte: 'Checks for a value that is less than or equal to the input provided',
  $lte_date: 'Checks for a date that is less than the date provided',
  $regex: 'Checks for a value matching the regex provided',
  $array_contains: 'Checks if an array contains the input provided',
  $array_not_contains: 'Checks if an array does not contain the input provided',
  $null: 'Checks for values which are null',
  $not_null: 'Checks for values which are not null',
};

export const SupportedOperators = Object.keys(Operators);

export type ConstraintOperator = keyof typeof Operators;

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
