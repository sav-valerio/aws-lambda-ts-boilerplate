const path = require('path');
const slsw = require('serverless-webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    // https://webpack.js.org/configuration/mode/
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    // https://webpack.js.org/configuration/devtool/
    devtool: slsw.lib.webpack.isLocal ? 'source-map' : 'cheap-source-map',

    // The provided argument will be an object referencing functions as defined in your `serverless.yml` .
    // https://webpack.js.org/concepts/entry-points/
    entry: slsw.lib.entries,
    target: 'node',
    resolve: {
        extensions: ['.cjs', '.mjs', '.js', '.ts'],
        // Add support to path aliases
        // https://github.com/dividab/tsconfig-paths-webpack-plugin
        plugins: [new TsconfigPathsPlugin()],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js',
    },
    // Exclude packages from the final bundle(s)
    externals: {},
    module: {
        // Instruct Webpack to use the `ts-loader` for any TypeScript files, else it
        // won't know what to do with them. 
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                exclude: [
                    [
                        path.resolve(__dirname, '.webpack'),
                        path.resolve(__dirname, '.serverless'),
                    ],
                ],
            },
        ],
    },
    // We still want type checking, just without the burden on build performance, 
    // so we use a plugin to take care of it on another thread.
    plugins: [new ForkTsCheckerWebpackPlugin()],
};