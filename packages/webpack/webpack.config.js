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
  entry: './src',
  output: {
    path: path.resolve(cwd, 'dist'),
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
        test: /\.jsx?$/,
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
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
  },
  plugins: [new VueLoaderPlugin()],
};
