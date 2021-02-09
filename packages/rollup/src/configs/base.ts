/* eslint-disable no-param-reassign */
import path from 'path';

import { DEFAULT_EXTENSIONS } from '@babel/core';
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
import styles from 'rollup-plugin-styles';
import visualizer from 'rollup-plugin-visualizer';
import { terser } from 'rollup-plugin-terser';
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
    ],

    plugins: [
      replace(),
      sizes(),
      visualizer(),
      url(),
      styles(),
      progress(),
      graphql(),
      json(),
      nodeResolve({
        browser: true,
        moduleDirectories: ['../../node_modules'],
        preferBuiltins: true,
      }),
      commonjs({
        include: '../../node_modules/**',
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

    external: ['vue'],
  };

  if (!isDevelopmentMode() && config.plugins) {
    config.plugins.push(terser());
  }

  return config;
};
