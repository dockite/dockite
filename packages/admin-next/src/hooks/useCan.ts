import { can as canPerformAction } from '@dockite/ability';

import { useAuth } from './useAuth';

export interface UseCanHook {
  can: (action: string) => boolean;
  cant: (action: string) => boolean;
}

export const useCan = (): UseCanHook => {
  const { state } = useAuth();

  const can = (action: string): boolean => {
    if (!state.user) {
      return false;
    }

    return canPerformAction(state.user.normalizedScopes, action);
  };

  const cant = (action: string): boolean => {
    return !can(action);
  };

  return { can, cant };
};

export default useCan;
