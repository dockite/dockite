import { OrQuery, AndQuery, PossibleConstraints, Constraint } from './types';

/**
 * Translates an array of column parts into a fully qualified JSON column path.
 *
 * @param parts string[]
 * @param type 'native' | 'text'
 * @param prefix string
 *
 * @example ['data', 'nested', 'field'] <native> => data->nested->field
 * @example ['data', 'nested', 'field'] <text> => data->nested->>field
 */
export const columnPartsToColumn = (parts: string[], type: 'native' | 'text' = 'text'): string => {
  const [final, ...other] = parts
    .reverse()
    .map((part, i) => (i === parts.length - 1 ? part : `'${part}'`));

  const columnPath = other.reverse().join('->');

  switch (type) {
    case 'native':
      console.log({ type, path: `${columnPath}->${final}` });
      return `${columnPath}->${final}`;
    case 'text':
      console.log({ type, path: `${columnPath}->>${final}` });
      return `${columnPath}->>${final}`;
    default:
      return `${columnPath}->>${final}`;
  }
};

/**
 * Turn an abritary string into its best guess native type
 *
 * For those of you reading out there, this ones for you.
 *
 * @param input string
 *
 * @example '1' => 1:number
 * @example '["one", "two"]' => ['one', 'two']:array
 */
export function unsafeStringToNativeType<T = any>(input: string): T {
  try {
    return JSON.parse(input);
  } catch {
    return input as any;
  }
}

export function isOrQuery(constraint: PossibleConstraints): constraint is OrQuery {
  return (constraint as OrQuery).OR !== undefined;
}

export function isAndQuery(constraint: PossibleConstraints): constraint is AndQuery {
  return (constraint as AndQuery).AND !== undefined;
}

export function isBaseConstraint(constraint: PossibleConstraints): constraint is Constraint {
  return (constraint as AndQuery).AND === undefined && (constraint as OrQuery).OR === undefined;
}
