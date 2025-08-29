const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  target: 'node',
  externals: [
    // Exclude node_modules from the bundle to reduce memory usage
    /^[a-z\-0-9]+$/ // Include all node_modules
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.prod.json'),
              transpileOnly: true, // This reduces memory usage
              compilerOptions: {
                module: 'commonjs',
                target: 'es2022'
              },
              // Reduce memory usage
              experimentalWatchApi: false,
            }
          }
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  optimization: {
    // Reduce memory usage during build
    removeAvailableModules: true,
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    flagIncludedChunks: true,
    // Minimize memory usage
    minimize: false,
  },
  // Reduce memory usage
  stats: 'errors-only',
  performance: {
    hints: false,
  },
};