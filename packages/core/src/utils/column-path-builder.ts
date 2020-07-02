/**
 *
 * @param str The input path
 */
export const strToColumnPath = (str: string, splitChar = '.'): string => {
  return str
    .split(splitChar)
    .map((chunk, i) => {
      if (i === 0) {
        return chunk;
      }

      return `'${chunk}'`;
    })
    .join(' ->');
};
