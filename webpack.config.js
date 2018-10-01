"use strict";

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const JavaScriptObfuscator = require("webpack-obfuscator");
var HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  mode: "production",
  entry: {
    about: "./src/js/aboutPage.js",
    receive: "./src/js/receivePage.js",
    upload: "./src/js/uploadPage.js",
    alert: "./src/js/alert.js",
    history: "./src/js/historyPage.js"
  },
  // devtool: "inline-source-map",
  output: {
    filename: "[name].bundle.js",
    publicPath: "",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "./html/about.html",
      template: "./src/html/about.html",
      chunks: ["about"],
      minify: { collapseWhitespace: true },
      inlineSource: ".(js|css)$"
    }),
    new HtmlWebpackPlugin({
      filename: "./html/index.html",
      template: "./src/html/index.html",
      chunks: ["upload"],
      minify: { collapseWhitespace: true },
      inlineSource: ".(js|css)$"
    }),
    new HtmlWebpackPlugin({
      filename: "./html/receive.html",
      template: "./src/html/receive.html",
      chunks: ["receive"],
      minify: { collapseWhitespace: true },
      inlineSource: ".(js|css)$"
    }),
    new HtmlWebpackPlugin({
      filename: "./html/history.html",
      template: "./src/html/history.html",
      chunks: ["history"],
      minify: { collapseWhitespace: true },
      inlineSource: ".(js|css)$"
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new JavaScriptObfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.2,
      deadCodeInjection: false,
      debugProtection: true,
      debugProtectionInterval: true,
      disableConsoleOutput: true,
      identifierNamesGenerator: "mangled",
      log: false,
      renameGlobals: false,
      rotateStringArray: true,
      // selfDefending: true,
      stringArray: true,
      stringArrayEncoding: "base64",
      stringArrayThreshold: 0.75,
      unicodeEscapeSequence: false
    })
  ]
};
