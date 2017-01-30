const webpack = require('webpack');

module.exports = {
  entry: './src/app.js',
  output: {
    path: __dirname + '/dist',
    filename: 'app.bundle.js',
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
      'process.ammoPath': '"http://127.0.0.1:8000/dist/ammo.js"',
    }),
    new webpack.NormalModuleReplacementPlugin(/inline\-worker/, 'webworkify-webpack'),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        hoist_funs: false, // Turn this off to prevent errors with Ammo.js
        warnings: false,
      },
      minimize: true,
    }),
    // new webpack.optimize.DedupePlugin(),
  ]
};
