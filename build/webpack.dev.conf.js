"use strict";

const config = {
  devtool: "eval-cheap-module-source-map",
  performance: {
    hints: "warning",
  },
  host: "0.0.0.0",
  port: 8080,
};
const FriendlyErrorsWebpackPlugin = require("@soda/friendly-errors-webpack-plugin");
const packageConf = require("../package.json");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const portFinder = require("portfinder");
const os = require("os");
const path = require("path");
const baseConfig = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HOST = process.env.HOST;
const PORT = process.env.PORT && Number(process.env.PORT);
const devConfig = merge(baseConfig, {
  mode: "development",
  output: {
    library: "hmicore",
    libraryTarget: "umd",
  },
  devtool: config.devtool,
  plugins: [
    new webpack.DefinePlugin({
      "process.env": '"development"',
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "public/index.html",
      inject: true,
    }),
  ],
  devServer: {
    compress: false,
    hot: true,
    open: false,
    host: HOST || config.host,
    port: PORT || config.port,
  },
});

module.exports = new Promise((resolve, reject) => {
  const networks = os.networkInterfaces();
  let ip;
  for (let i in networks) {
    for (let data of networks[i]) {
      if (!data.internal && data.family === "IPv4") {
        ip = data.address;
        break;
      }
    }
    if (ip) break;
  }

  portFinder.basePort = process.env.PORT || config.port;
  portFinder.getPort((err, port) => {
    if (err) {
      reject(err);
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port;
      // add port to devServer config
      devConfig.devServer.port = port;

      // Add FriendlyErrorsPlugin
      devConfig.plugins.push(
        new FriendlyErrorsWebpackPlugin({
          compilationSuccessInfo: {
            messages: [
              `Project is running at\nhttp://${ip}:${port}\nhttp://127.0.0.1:${port}`,
            ],
            notes: [`Author: ${packageConf.author}`],
          },
          onErrors: config.notifyOnErrors
            ? util.createNotifierCallback()
            : undefined,
        })
      );

      resolve(devConfig);
    }
  });
});
