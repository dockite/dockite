import debug from 'debug';

const log = debug('dockite:manager:scopes');

export type DockiteScopeManager = string[];

export const ScopeManager: DockiteScopeManager = [];

export const ScopeIdMap: Record<string, string> = {};

export const registerScopeResourceId = (id: string, resourceName: string): void => {
  if (!ScopeIdMap[id]) {
    ScopeIdMap[id] = resourceName;
  }
};

export const getScopeResourceById = (id: string): string | null => {
  if (ScopeIdMap[id]) {
    return ScopeIdMap[id];
  }

  return null;
};

export const registerScopes = (...scopes: string[]): void => {
  scopes.forEach(scope => {
    if (!ScopeManager.includes(scope)) {
      log(`registering scope ${scope}`);

      ScopeManager.push(scope);
    }
  });
};
