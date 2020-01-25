/* global __dirname */

const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');

module.exports = {
    entry: {
        main: ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000', './src/index.js']
    },
    output: {
        path: path.resolve(__dirname, 'dist/public'),
        publicPath: '/assets/',
        filename: '[name].js'
    },
    devServer: {
        contentBase: './dist',
        hot: true,
        historyApiFallback: true
    },
    mode: 'development',
    target: 'web',
    devtool: 'source-map',
    resolve : {        
        modules: [path.resolve('./src'), 'node_modules', 'docs', 'forms', 'dist'],     
        extensions: ['.js', '.jsx'],
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "eslint-loader",
                options: {
                    emitWarning: true,
                    failOnError: false,
                    failOnWarning: false
                }
            },            
            {
                test: /\.js(x)?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/react', {
                            'plugins': ['@babel/plugin-proposal-class-properties']
                        }]
                    }
                }
            },            
            {
                test: /\.html$/,
                use: {
                    loader: "html-loader",
                }
            },
            {
                test: /\.ejs$/,
                use: {
                    loader: "ejs-loader",
                    query: {
                        interpolate: /\{\{(.+?)\}\}/g,
                        evaluate: /\[\[(.+?)\]\]/g
                    }
                }
            },
            { 
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.(png|svg|jpg|gif|xml|yaml)$/,
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
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
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
        new webpack.DefinePlugin({ 
            "process.browser" : "true",
        }),       
    ]
};