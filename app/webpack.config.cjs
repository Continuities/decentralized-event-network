const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FlowWebpackPlugin = require('flow-webpack-plugin');

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /(node_modules|bower_components)/,
      use: [ "babel-loader", 'eslint-loader' ]
    }, {
      test: /\.css$/,
      use: ["style-loader", "css-loader"]
    }]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "dist/"),
    publicPath: "/",
    filename: "bundle.js"
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    historyApiFallback: true
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DOMAIN: 'http://localhost'
    }),
    new FlowWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "static", "index.html"),
      filename: 'index.html'
    })
  ]
};
