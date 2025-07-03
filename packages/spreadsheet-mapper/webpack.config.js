const path = require('path');

module.exports = {
  mode: 'production', // or 'development'
  entry: './index.ts', // Main entry point for the library
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'spreadsheetMapper',
      type: 'umd',
      export: 'default',
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
        exclude: [
          /node_modules/,
          /examples/,
          /\.test\.(ts|tsx)$/,
          /\.spec\.(ts|tsx)$/
        ],
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json'
          }
        },
      },
    ],
  },
  externals: {
    react: 'react', // Mark react as an external dependency
  },
};
