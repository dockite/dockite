/* eslint-disable no-param-reassign */
import fs from 'fs';
import path from 'path';

import { DEFAULT_EXTENSIONS } from '@babel/core';
import alias from '@rollup/plugin-alias';
import html from '@rollup/plugin-html';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { OutputOptions, RollupOptions } from 'rollup';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';

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
        plugins: [
          visualizer({
            filename: 'stats.es.html',
            template: 'sunburst',
          }),
        ],
      },
    ],

    external: [],
  };

  if (config.plugins) {
    config.plugins.unshift(
      alias({
        entries: [
          { find: '~/', replacement: path.resolve(cwd, './src/') },
          { find: 'type-graphql', replacement: 'type-graphql/dist/browser-shim.js' },
          { find: 'typeorm', replacement: 'typeorm/typeorm-model-shim.js' },
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
      serve({
        contentBase: [path.resolve(cwd, './lib/es')],
        historyApiFallback: true,
        host: process.env.HOST || 'localhost',
        port: Number(process.env.PORT) || 4000,
        https: !process.env.HTTPS
          ? undefined
          : {
              key: fs.readFileSync(path.resolve(__dirname, '../certs/localhost.key')),
              cert: fs.readFileSync(path.resolve(__dirname, '../certs/localhost.crt')),
            },
      }),
    );
  }

  if (!isDevelopmentMode() && config.plugins) {
    config.plugins.push(terser());
  }

  return config;
};
