'use strict';

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
  devtool: 'source-map',
  plugins: [
    new CopyPlugin([
      {
        from: path.join(__dirname, '/static'),
        to: path.join(__dirname, '/dist/static'),
        ignore: ['.*'],
      },
    ]),
  ],
};
