import config, { isProduction } from './webpack.config.babel'
import webpack from 'webpack';

const devConfig  = {
  ...config,  
  
  entry: './src/entry.js',

  plugins: [ 
    new webpack.DefinePlugin({
      'process.ammoPath': '"/vendor/ammo.js"',
    }),
  ],
}

export {
  devConfig as default,
}
