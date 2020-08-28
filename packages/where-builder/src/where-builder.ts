/* eslint-disable @typescript-eslint/camelcase */
import { randomBytes } from 'crypto';

import { Brackets, WhereExpression } from 'typeorm';

import { ConstraintArray, ConstraintHandlerFn, ConstraintOperator, QueryBuilder } from './types';
import {
  columnPartsToColumn,
  isAndQuery,
  isOrQuery,
  isBaseConstraint,
  unsafeStringToNativeType,
} from './util';

const ConstraintHandlerMap: Record<ConstraintOperator, ConstraintHandlerFn> = {
  $eq: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`${name} = :${param}`, { [param]: constraint.value });
  },

  $ne: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`${name} != :${param}`, { [param]: constraint.value });
  },

  $gt: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'native');

    qb.andWhere(`${name} > :${param}`, { [param]: unsafeStringToNativeType(constraint.value) });
  },

  $gte: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'native');

    qb.andWhere(`${name} >= :${param}`, { [param]: unsafeStringToNativeType(constraint.value) });
  },

  $lt: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'native');

    qb.andWhere(`${name} < :${param}`, { [param]: unsafeStringToNativeType(constraint.value) });
  },

  $lte: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'native');

    qb.andWhere(`${name} <= :${param}`, { [param]: unsafeStringToNativeType(constraint.value) });
  },

  $gt_date: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`(${name})::timestamp > (:${param})::timestamp`, {
      [param]: unsafeStringToNativeType(constraint.value),
    });
  },

  $gte_date: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`(${name})::timestamp >= (:${param})::timestamp`, {
      [param]: unsafeStringToNativeType(constraint.value),
    });
  },

  $lt_date: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`(${name})::timestamp < (:${param})::timestamp`, {
      [param]: unsafeStringToNativeType(constraint.value),
    });
  },

  $lte_date: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`(${name})::timestamp <= (:${param})::timestamp`, {
      [param]: unsafeStringToNativeType(constraint.value),
    });
  },

  $like: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`${name} LIKE :${param}`, { [param]: `%${constraint.value}%` });
  },

  $ilike: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`${name} ILIKE :${param}`, { [param]: `%${constraint.value}%` });
  },

  $array_contains: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'native');

    qb.andWhere(`${name} ? :${param}`, {
      [param]: unsafeStringToNativeType(constraint.value),
    });
  },

  $array_not_contains: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'native');

    qb.andWhere(`NOT ${name} ? :${param}`, {
      [param]: unsafeStringToNativeType(constraint.value),
    });
  },

  $regex: (qb, constraint) => {
    const param = randomBytes(6).toString('hex');
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`${name} ~ :${param}`, { [param]: constraint.value });
  },

  $null: (qb, constraint) => {
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`COALESCE(${name}, '') = ''`);
  },

  $not_null: (qb, constraint) => {
    const name = columnPartsToColumn(['data', ...constraint.name.split('.')], 'text');

    qb.andWhere(`COALESCE(${name}, '') != ''`);
  },
};

export class WhereBuilder {
  static OrBuilder(qb: WhereExpression, constraints: ConstraintArray): void {
    qb.orWhere(
      new Brackets(q => {
        constraints.forEach(constraint => {
          if (isAndQuery(constraint)) {
            this.Build(q, constraint);
          }

          if (isOrQuery(constraint)) {
            this.Build(q, constraint);
          }

          if (isBaseConstraint(constraint)) {
            ConstraintHandlerMap[constraint.operator](q, constraint);
          }
        });
      }),
    );
  }

  static AndBuilder(qb: WhereExpression, constraints: ConstraintArray): void {
    qb.andWhere(
      new Brackets(q => {
        constraints.forEach(constraint => {
          if (isAndQuery(constraint)) {
            this.Build(q, constraint);
          }

          if (isOrQuery(constraint)) {
            this.Build(q, constraint);
          }

          if (isBaseConstraint(constraint)) {
            ConstraintHandlerMap[constraint.operator](q, constraint);
          }
        });
      }),
    );
  }

  static Build(qb: WhereExpression, query: QueryBuilder): void {
    if (isOrQuery(query)) {
      this.OrBuilder(qb, query.OR);
      return;
    }

    if (isAndQuery(query)) {
      this.AndBuilder(qb, query.AND);
    }
  }
}
