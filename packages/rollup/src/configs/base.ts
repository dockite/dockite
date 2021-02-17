/* eslint-disable no-param-reassign */
import path from 'path';

import { DEFAULT_EXTENSIONS } from '@babel/core';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import graphql from '@rollup/plugin-graphql';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import url from '@rollup/plugin-url';
import { RollupOptions } from 'rollup';
import postcss from 'rollup-plugin-postcss';
import progress from 'rollup-plugin-progress';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import visualizer from 'rollup-plugin-visualizer';
import vue from 'rollup-plugin-vue';

import { isDevelopmentMode } from '../utils';

export const getBaseRollupConfiguration = (): RollupOptions => {
  const cwd = process.cwd();

  const config: RollupOptions = {
    input: path.join(cwd, './src/index.ts'),

    output: [
      {
        file: path.join(cwd, './lib/index.js'),
        format: 'commonjs',
      },
      {
        file: path.join(cwd, './lib/index.esm.js'),
        format: 'es',
      },
      {
        file: path.join(cwd, './lib/index.esm.min.js'),
        format: 'es',
        plugins: [terser()],
      },
    ],

    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        DOCKITE_APP_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(true),
      }),
      visualizer(),
      postcss({
        minimize: !isDevelopmentMode(),
        extract: !!process.env.EXTRACT_CSS,
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
          compilerOptions: {
            module: 'ESNext',
            target: 'ESNext',
          },
        },
        rollupCommonJSResolveHack: true,
      }),
      commonjs(),
      vue(),
      // dynamicImportVars(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
      }),
      url({
        include: [
          '**/*.svg',
          '**/*.png',
          '**/*.jp(e)?g',
          '**/*.gif',
          '**/*.webp',
          '**/*.woff2?',
          '**/*.[ot]tf',
        ],
      }),
    ],

    external: ['vue'],
  };

  if (!isDevelopmentMode() && config.plugins) {
    // config.plugins.push(terser());
  }

  return config;
};
