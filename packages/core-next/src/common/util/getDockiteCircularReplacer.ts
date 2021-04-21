type CircularReplacerFn = (key: string, value: any) => any;

/**
 *
 */
export const getDockiteCircularReplacer = (): CircularReplacerFn => {
  const set = new WeakSet();

  return (key: string, value: any) => {
    if (key === 'dockiteField') {
      return undefined;
    }

    // If we're dealing with an object-like value that isn't null
    // then we need to handle possible circular references
    if (typeof value === 'object' && value !== null) {
      if (set.has(value)) {
        return undefined;
      }

      set.add(value);
    }

    return value;
  };
};

export default getDockiteCircularReplacer;
