import fs from 'fs';
import path from 'path';

/**
 * Checks if a provided package path can be found relative to the current working directory,
 * if so it creates an absolute path based on the current working direction and the path provided.
 *
 * Required for loading custom entities and listeners from relative directories within the config file.
 */
const getPackagePath = (pkgPath: string): string => {
  if (fs.existsSync(path.join(process.cwd(), pkgPath))) {
    return path.join(process.cwd(), pkgPath);
  }

  return pkgPath;
};

/**
 * Imports a module from a designated path or package name returning either the default export
 * if an esModule is encountered or the module itself if it is a CommonJS module.
 */
export const importModule = async <T = any>(identifier: string): Promise<T> => {
  return import(getPackagePath(identifier)).then(mod => {
    // eslint-disable-next-line no-underscore-dangle
    return mod.default && mod.__esModule ? mod.default : mod;
  });
};

export default importModule;
