/* eslint-disable no-param-reassign */
import path from 'path';

import { RollupOptions } from 'rollup';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import graphql from '@rollup/plugin-graphql';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import strip from '@rollup/plugin-strip';
import typescript from 'rollup-plugin-typescript2';
import url from '@rollup/plugin-url';
import progress from 'rollup-plugin-progress';
import sizes from 'rollup-plugin-sizes';
import postcss from 'rollup-plugin-postcss';
import visualizer from 'rollup-plugin-visualizer';
import { terser } from 'rollup-plugin-terser';
import vue from 'rollup-plugin-vue';
import { DEFAULT_EXTENSIONS } from '@babel/core';

import { isDevelopmentMode } from '../utils';

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
        file: path.join(cwd, './lib/ui/index.min.js'),
        format: 'commonjs',
        plugins: [terser()],
      },
      {
        file: path.join(cwd, './lib/ui/index.esm.js'),
        format: 'es',
      },
      {
        file: path.join(cwd, './lib/ui/index.esm.min.js'),
        format: 'es',
        plugins: [terser()],
      },
    ],

    plugins: [
      replace(),
      sizes(),
      visualizer(),
      url(),
      postcss({
        minimize: !isDevelopmentMode(),
      }),
      progress(),
      graphql(),
      json(),
      nodeResolve({
        browser: true,
        moduleDirectories: ['../../node_modules'],
        preferBuiltins: true,
      }),
      typescript({
        tsconfigOverride: {
          exclude: ['lib', 'node_modules', 'src/**/*.spec.ts'],
          compilerOptions: {
            module: 'ESNext',
            target: 'ESNext',
            declarationDir: './lib',
          },
        },
        useTsconfigDeclarationDir: true,
        rollupCommonJSResolveHack: true,
      }),
      commonjs(),
      strip({
        include: ['**/*.(mjs|jsx|js|ts|tsx)'],
      }),
      vue(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
      }),
    ],

    external: ['vue', 'vue-router', /lodash/, 'graphql-tag'],
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
