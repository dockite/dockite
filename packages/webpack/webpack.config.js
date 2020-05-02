/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

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
  externals: {
    vue: 'Vue',
    'ant-design-vue': 'antDesignVue',
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
        },
      },
      {
        test: /\.m?jsx?$/,
        include: [path.join(cwd, 'src')],
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
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
  resolve: {
    extensions: ['.tsx', '.ts', '.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'],
  },
  plugins: [new VueLoaderPlugin(), new BundleAnalyzerPlugin({ analyzerMode: 'static' })],
};
