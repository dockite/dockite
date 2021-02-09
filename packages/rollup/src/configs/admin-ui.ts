/* eslint-disable no-param-reassign */
import path from 'path';

import html from '@rollup/plugin-html';
import { RollupOptions } from 'rollup';
import dev from 'rollup-plugin-dev';

import { isDevelopmentMode } from '../utils';

import { getBaseRollupConfiguration } from './base';

export const getAdminUiRollupConfiguration = (): RollupOptions => {
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

    external: [],
  };

  if (config.plugins) {
    config.plugins.push(html());
  }

  if (isDevelopmentMode() && config.plugins) {
    config.plugins.push(dev());
  }

  return config;
};
