/* global __dirname */

const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const DotenvWebpackPlugin = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const SERVER_PATH = path.resolve(__dirname, 'server', 'server.js');

if(process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV="production"
}

module.exports = {
    entry: {
        server: SERVER_PATH,
        main: ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000', SERVER_PATH]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js'
    },
    target: 'node',
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false,   // if you don't put this is, __dirname
        __filename: false,  // and __filename return blank or /
    },
    externals: [nodeExternals()], // Need this to avoid error when working with Express
    resolve : {
        modules: [path.resolve(__dirname, 'docs')],
    },
    module: {
        rules: [
            {
                // Transpiles ES6-8 into ES5
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                },
            },
            {
                test: /\.(png|svg|jpg|gif|xml|yaml)$/,
                use: {
                    loader: "file-loader"
                },
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new DotenvWebpackPlugin({
            path: './.env.server'
        }),
        new CopyWebpackPlugin([
            { from: 'forms', to: 'forms' },
            { from: 'server/docs', to: 'docs' },
            { from: 'public', to: 'public' },
        ]),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV" : JSON.stringify(process.env.NODE_ENV)
        })
    ]
};
