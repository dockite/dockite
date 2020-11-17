import { getConfig } from '../config';
import { getPackage } from '../utils/get-package';

const config = getConfig();

export const getListeners = async (): Promise<Record<string, Function>[]> => {
  console.log(config.listeners);

  if (config.listeners) {
    const listeners = await Promise.all(
      config.listeners.map(async listener => {
        const pkg = getPackage(listener);

        const resolved = await import(pkg);

        if (resolved.default) {
          return resolved.default;
        }

        return resolved;
      }),
    );

    return listeners;
  }

  return [];
};
