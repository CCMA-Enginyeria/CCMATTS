const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'CCMATTS',
    libraryTarget: 'umd',  
    filename: 'ccma.tts.min.js',
    path: path.resolve(__dirname, 'dist'),
  }, 
  externals: {
    jquery: 'jQuery',
    underscore: '_',
    backbone: 'Backbone'
  }
};