const path = require('path');

module.exports = {
  mode: 'production', // or 'development'
  entry: './useSpreadsheetMapper.ts', // Main entry point for the library
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'spreadsheetMapper',
      type: 'umd',
    },
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  externals: {
    react: 'react', // Mark react as an external dependency
  },
};
