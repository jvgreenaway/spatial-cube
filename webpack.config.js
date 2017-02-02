const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  target: 'web',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['babel-loader'],
    }],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/inline\-worker/, 'webworkify-webpack'),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        hoist_funs: false, // Turn this off to prevent errors with Ammo.js
        warnings: false,
      },
      minimize: true,
    }),
  ]
};
