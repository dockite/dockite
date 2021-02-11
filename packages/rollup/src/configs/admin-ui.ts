/* eslint-disable no-param-reassign */
import path from 'path';

import { DEFAULT_EXTENSIONS } from '@babel/core';
import alias from '@rollup/plugin-alias';
import html from '@rollup/plugin-html';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import compress from 'koa-compress';
import { OutputOptions, RollupOptions } from 'rollup';
import copy from 'rollup-plugin-copy';
import dev from 'rollup-plugin-dev';
import { terser } from 'rollup-plugin-terser';

import { getAdminHtmlTemplate, isDevelopmentMode } from '../utils';

import { getBaseRollupConfiguration } from './base';

const customResolver = nodeResolve({
  extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
}) as any;

export const getAdminUiRollupConfiguration = (
  getDockiteConfig: () => Record<string, any>,
  omitSensitiveValues: () => any,
  getDockiteFields: () => any[],
): RollupOptions => {
  const cwd = process.cwd();

  const baseConfig = getBaseRollupConfiguration();

  const dockiteConfig = getDockiteConfig();

  const config: RollupOptions = {
    ...baseConfig,

    input: path.join(cwd, './src/main.ts'),

    output: [
      {
        dir: path.join(cwd, './lib/cjs'),
        entryFileNames: 'main-[hash].js',
        chunkFileNames: 'chunk-[hash].js',
        format: 'commonjs',
      },
      {
        dir: path.join(cwd, './lib/es'),
        entryFileNames: 'main-[hash].js',
        chunkFileNames: 'chunk-[hash].js',
        format: 'es',
      },
    ],

    external: [],
  };

  if (config.plugins) {
    config.plugins.unshift(
      alias({
        entries: [
          { find: '~/', replacement: path.resolve(cwd, './src/') },
          // { find: '@/', replacement: path.resolve(cwd, './src/') },
        ],
        customResolver,
      }),

      copy({
        targets: (config.output as OutputOptions[]).map(entry => {
          return {
            src: path.resolve(
              path.dirname(require.resolve('element-plus')),
              './theme-chalk/fonts/*',
            ),
            dest: path.resolve(entry.dir || '', './fonts'),
          };
        }),
      }),

      replace({
        DOCKITE_CONFIG: JSON.stringify(dockiteConfig, omitSensitiveValues),
        DOCKITE_FIELDS: getDockiteFields(),
        __DEV__: JSON.stringify(isDevelopmentMode()),
      }),
    );

    config.plugins.push(
      html({
        title: dockiteConfig.app.title,
        template: getAdminHtmlTemplate,
      }),
    );
  }

  if (isDevelopmentMode() && config.plugins) {
    config.plugins.unshift(
      dev({
        dirs: [path.resolve(cwd, './lib/es')],
        spa: true,
        port: Number(process.env.PORT) || 4000,
        extend: (app: any) => {
          app.use(compress());
        },
      }),
    );
  }

  if (!isDevelopmentMode() && config.plugins) {
    config.plugins.push(terser());
  }

  return config;
};
