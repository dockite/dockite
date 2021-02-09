/* eslint-disable no-param-reassign */
import path from 'path';

import { RollupOptions } from 'rollup';
import alias from '@rollup/plugin-alias';

import { getBaseRollupConfiguration } from './base';

export const getDockiteFieldRollupConfiguration = (): RollupOptions => {
  const cwd = process.cwd();

  const baseConfig = getBaseRollupConfiguration();

  const config: RollupOptions = {
    ...baseConfig,

    input: path.join(cwd, './src/ui/index.ts'),

    output: [
      {
        file: path.join(cwd, './lib/ui/index.js'),
        format: 'commonjs',
      },
      {
        file: path.join(cwd, './lib/ui/index.esm.js'),
        format: 'es',
      },
    ],
  };

  if (config.plugins) {
    // config.plugins.unshift(
    //   alias({
    //     entries: [
    //       {
    //         find: /type-graphql/,
    //         replacement: 'type-graphql/dist/browser-shim.js',
    //       },
    //       {
    //         find: /typeorm/,
    //         replacement: path.join(
    //           path.dirname(require.resolve('@dockite/database')),
    //           'extra/typeorm-model-shim.js',
    //         ),
    //       },
    //     ],
    //   }),
    // );
  }

  return config;
};
