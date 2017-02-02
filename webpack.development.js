const webpack = require('webpack');

module.exports = {
  entry: './src/entry.js',
  output: {
    path: __dirname + '/tmp',
    filename: 'entry.js',
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
    new webpack.DefinePlugin({
      'process.ammoPath': '"http://127.0.0.1:8000/vendor/ammo.js"',
    }),
    new webpack.NormalModuleReplacementPlugin(/inline\-worker/, 'webworkify-webpack'),
  ]
};
