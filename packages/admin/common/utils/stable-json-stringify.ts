// That is horrifying
export const stableJSONStringify = (obj: any, space = 2): string => {
  const keys: string[] = [];

  JSON.stringify(obj, (key, value) => {
    keys.push(key);
    return value;
  });

  keys.sort();

  return JSON.stringify(obj, keys, space);
};
