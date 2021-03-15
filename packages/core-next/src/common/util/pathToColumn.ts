/**
 * Transforms a dot-notation path into a full qualified psql column path.
 *
 * @example
 * const shortColumnPath = pathToColumn('updatedAt');
 * // updatedAt
 * const nativeColumnPath = pathToColumn('data.some.nested.path', 'native');
 * // data->'some'->'nested'->'path'
 * const textColumnPath = pathToColumn('data.some.nested.path', 'native');
 * //data->'some'->'nested'->>'path'
 */
export const pathToColumn = (path: string, type: 'native' | 'text' = 'text'): string => {
  // Get the path segments by splitting the path on the '.' character
  const pathSegments = path.split('.');

  // Get the final path segment and then all other path segments using destructuring
  const [final, ...other] = pathSegments
    .reverse()
    .map((part, i) => (i === pathSegments.length - 1 ? part : `'${part}'`));

  if (other.length === 0) {
    return final;
  }

  const columnPath = other.reverse().join('->');

  switch (type) {
    case 'native':
      return `${columnPath}->${final}`;
    case 'text':
    default:
      return `${columnPath}->>${final}`;
  }
};

export default pathToColumn;
