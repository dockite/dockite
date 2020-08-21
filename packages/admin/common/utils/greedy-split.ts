export const greedySplit = (str: string, char: string, max: number): string[] => {
  const parts = str.split(char);

  return [...parts.slice(0, max), parts.slice(max).join(char)];
};
