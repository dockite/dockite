/**
 * Given a provided input return its boolean value based on simple heuristics.
 */
export const getBoolean = (input: any): boolean => {
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true';
  }

  if (typeof input === 'number') {
    return input > 0;
  }

  return !!input;
};

export default getBoolean;
