import { Modifiers } from '@apollo/client/cache/core/types/common';

export const deleteFields = (...args: string[]): Modifiers => {
  const modifiers: Modifiers = {};

  args.forEach(arg => {
    modifiers[arg] = (_, details) => details.DELETE;
  });

  return modifiers;
};

export default deleteFields;
