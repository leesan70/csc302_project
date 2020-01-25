/* global __dirname */

const path = require("path");
const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');

module.exports = {
    entry: {
        main: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist/public'),
        publicPath: '/',
        filename: '[name].js'
    },
    mode: 'production',
    target: 'web',
    devtool: 'source-map',
    resolve : {
        modules: [path.resolve('./src'), 'node_modules', 'docs', 'forms', 'dist'],
        extensions: ['.js', '.jsx']
    },
    // Webpack 4 does not have a CSS minifier, although
    // Webpack 5 will likely come with one
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    module: {
        rules: [
            {
                // Transpiles ES6-8 into ES5
                test: /\.js(x)?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env', '@babel/react', {
                            'plugins': ['@babel/plugin-proposal-class-properties']
                        }]
                    }
                }
            },
            {
                // Loads the javacript into html template provided.
                // Entry point is set below in HtmlWebPackPlugin in Plugins 
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: { minimize: true }
                    }
                ]
            },
            {
                test: /\.ejs$/,
                use: [
                    {
                        loader: "ejs-loader",
                        query: {
                            interpolate: /\{\{(.+?)\}\}/g,
                            evaluate: /\[\[(.+?)\]\]/g
                        }
                    }
                ]

            }, 
            { 
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }, 
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./public/index.html",
            filename: "./index.html",
            excludeChunks: [ 'server' ]
        }),
        new DotenvWebpackPlugin(),
        new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "$.jQuery": "jquery",
                "window.jQuery": "jquery" 
        }),
        new FaviconsWebpackPlugin({
            logo:'./public/icon.png',
            icons: {
              android: false,
              appleIcon: false,
              appleStartup: false,
              coast: false,
              favicons: true,
              firefox: false,
              opengraph: false,
              twitter: false,
              yandex: false,
              windows: false
            }
        }),
        new webpack.DefinePlugin({'process.browser': 'true'}),
    ]
}