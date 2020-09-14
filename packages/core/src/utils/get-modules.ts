import { getConfig } from '../config';

const config = getConfig();

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getModules = (type: 'internal' | 'external' = 'internal'): Promise<any>[] => {
  if (config.modules && config.modules[type] && config.modules[type].length > 0) {
    return config.modules[type].map(
      (mod): Promise<any> =>
        import(mod)
          .then(res => {
            if (res.default) {
              return Promise.resolve(res.default);
            }

            return Promise.resolve(res);
          })
          .then(res => {
            if (typeof res === 'function') {
              return res(config);
            }

            return res;
          }),
    );
  }

  return [];
};
