/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-param-reassign */

const path = require('path');

const { VueLoaderPlugin } = require('vue-loader');
const { NormalModuleReplacementPlugin, DefinePlugin } = require('webpack');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isDev =
  String(process.env.NODE_ENV)
    .slice(0, 3)
    .toLowerCase() === 'dev';

const cwd = process.cwd();

/**
 * @type {webpack.Configuration}
 */
const config = {
  mode: isDev ? 'development' : 'production',
  entry: {
    main: path.resolve(cwd, './src/ui/index.ts'),
  },
  output: {
    filename: 'index.js',
    path: path.resolve(cwd, 'lib', 'ui'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'],
    alias: {
      vue$: 'vue/dist/vue.runtime.esm-bundler.js',
      '@': path.resolve(cwd, 'src'),
      '~': path.resolve(cwd, 'src'),
    },
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
        test: /\.ts$/,
        include: [path.join(cwd, 'src')],
        exclude: /node_modules/,
        loaders: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              compilerOptions: {
                target: 'esnext',
                module: 'esnext',
                moduleResolution: 'node',
              },
            },
          },
        ],
      },
      {
        test: /\.tsx$/,
        include: [path.join(cwd, 'src')],
        exclude: /node_modules/,
        loaders: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              compilerOptions: {
                target: 'esnext',
                module: 'esnext',
                moduleResolution: 'node',
              },
            },
          },
        ],
      },
      {
        test: /\.m?js$/,
        include: [path.join(cwd, 'src')],
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.jsx$/,
        include: [path.join(cwd, 'src')],
        exclude: /node_modules/,
        loaders: ['babel-loader'],
      },
      {
        test: /\.(s|post)?css$/,
        include: [path.join(cwd, 'src')],
        loaders: [
          'vue-style-loader',
          'style-loader',
          'css-loader',
          { loader: 'postcss-loader' },
          'sass-loader',
        ],
        sideEffects: true,
      },
      {
        test: /\.(s|post)?css$/,
        include: /node_modules/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
        sideEffects: true,
      },
      {
        test: /\.g(raph)?ql$/,
        loader: 'graphql-tag/loader',
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loaders: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[ext]',
              outputPath: 'images/',
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        loaders: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  externals: {
    vue: 'Vue',
  },
  plugins: [
    new VueLoaderPlugin(),
    new DefinePlugin({
      DOCKITE_APP_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
    }),
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
  devtool: isDev ? 'inline-cheap-source-map' : 'hidden-source-map',
  devServer: {
    inline: true,
    hot: true,
    https: true,
    stats: 'minimal',
    contentBase: __dirname,
    overlay: true,
    port: 4000,
    compress: true,
    historyApiFallback: true,
    watchOptions: {
      ignored: ['**/dockite/fields.ts'],
    },
  },
  watchOptions: {
    ignored: ['**/dockite/fields.ts'],
  },
};

if (isDev || process.env.ANALYZE) {
  config.plugins.push(
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode: 'static',
    }),
  );
}

module.exports = config;
