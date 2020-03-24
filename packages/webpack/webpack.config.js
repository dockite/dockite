/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const VueLoaderPlugin = require('vue-loader/lib/plugin');

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
        use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'],
  },
  plugins: [new VueLoaderPlugin()],
};