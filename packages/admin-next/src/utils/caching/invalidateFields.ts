import { Modifiers } from '@apollo/client/cache/core/types/common';

export const invalidateFields = (...args: string[]): Modifiers => {
  const modifiers: Modifiers = {};

  args.forEach(arg => {
    modifiers[arg] = (_, details) => details.INVALIDATE;
  });

  return modifiers;
};

export default invalidateFields;
