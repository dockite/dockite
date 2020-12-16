import { can as canAbility } from '@dockite/ability';

import { useAuth } from './useAuth';

export type UseCanHook = (action: string) => boolean;

export const useCan = (): UseCanHook => {
  const { state } = useAuth();

  const can = (action: string): boolean => {
    if (!state.user) {
      return false;
    }

    return canAbility(state.user.normalizedScopes, action);
  };

  return can;
};

export default useCan;
