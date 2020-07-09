/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { NormalModuleReplacementPlugin } = require('webpack');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isDev =
  String(process.env.NODE_ENV)
    .slice(0, 3)
    .toLowerCase() === 'dev';

const cwd = process.cwd();

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: {
    main: './src/ui/index.ts',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(cwd, 'lib', 'ui'),
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        include: [path.join(cwd, 'src')],
        exclude: /node_modules/,
        loader: 'vue-loader',
      },
      {
        test: /\.tsx?$/,
        include: [path.join(cwd, 'src')],
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          compilerOptions: {
            module: 'esnext',
            target: 'ES6',
            moduleResolution: 'node',
          },
        },
      },
      {
        test: /\.m?jsx?$/,
        include: [path.join(cwd, 'src')],
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(s|post)?css$/,
        include: [path.join(cwd, 'src')],
        use: [
          'vue-style-loader',
          'style-loader',
          'css-loader',
          { loader: 'postcss-loader', options: { options: {} } },
          'sass-loader',
        ],
        sideEffects: true,
      },
      {
        test: /\.(s|post)?css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        sideEffects: true,
      },
    ],
  },
  externals: {
    vue: '$Vue',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'],
  },
  plugins: [
    new VueLoaderPlugin(),
    new NormalModuleReplacementPlugin(/type-graphql$/, resource => {
      resource.request = resource.request.replace(
        /type-graphql/,
        'type-graphql/dist/browser-shim.js',
      );
    }),
    new NormalModuleReplacementPlugin(/typeorm$/, resource => {
      resource.request = resource.request.replace(
        /typeorm/,
        path.join(
          path.dirname(require.resolve('@dockite/database')),
          'extra/typeorm-model-shim.js',
        ),
      );
    }),
  ],
};
