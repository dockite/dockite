/**
 * Imports a module from a designated path or package name returning either the default export
 * if an esModule is encountered or the module itself if it is a CommonJS module.
 */
export const importModule = async <T = any>(identifier: string): Promise<T> =>
  import(identifier).then(mod => {
    // eslint-disable-next-line no-underscore-dangle
    return mod.default && mod.__esModule ? mod.default : mod;
  });

export default importModule;
