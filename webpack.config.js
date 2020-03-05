const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'CCMATTS',
    libraryTarget: 'umd',  
    filename: 'ccma.tts.min.js',
    path: path.resolve(__dirname, 'dist'),
  }, 
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      _: "underscore",
      Backbone: "backbone"
    })
  ]
};