import { getConfig } from '../config';

const config = getConfig();

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getModules = (type: 'internal' | 'external' = 'internal'): any[] => {
  if (config.modules && config.modules.length > 0) {
    return config.modules
      .filter((mod): boolean => mod.type === type)
      .map((mod): Promise<any> => import(mod.location));
  }

  return [];
};
