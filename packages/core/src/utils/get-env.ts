export const getenv = (key: string, def = ''): string => {
  if (process.env[key]) {
    // Thanks typescript
    return process.env[key] as string;
  }

  return def;
};
