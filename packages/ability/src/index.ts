export const can = (
  availableScopes: string[],
  action: string,
  ...alternativeScopes: string[]
): boolean => {
  const actionType = action.split(':').pop();

  return availableScopes.some(
    scope =>
      scope === '*' ||
      scope === `*:${actionType}` ||
      scope === action ||
      alternativeScopes.includes(scope),
  );
};
