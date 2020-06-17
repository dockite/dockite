import debug from 'debug';

const log = debug('dockite:manager:scopes');

export type DockiteScopeManager = string[];

export const ScopeManager: DockiteScopeManager = [];

export const registerScopes = (...scopes: string[]): void => {
  scopes.forEach(scope => {
    if (!ScopeManager.includes(scope)) {
      log(`registering scope ${scope}`);

      ScopeManager.push(scope);
    }
  });
};
