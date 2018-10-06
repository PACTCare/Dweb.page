"use strict";

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const minifySettings = {
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: true,
  minifyURLs: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true
};
const obfuscatorSettings = {
  compact: true,
  controlFlowFlattening: false,
  //controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: false,
  // debugProtection: true, //causes loading problems
  // debugProtectionInterval: true, //caused issues on iphone
  disableConsoleOutput: true,
  // identifiersPrefix: "p",
  identifierNamesGenerator: "hexadecimal",
  log: false,
  renameGlobals: false,
  rotateStringArray: true,
  // selfDefending: true, // generaly causes problem
  stringArray: true,
  stringArrayEncoding: "base64",
  stringArrayThreshold: 1, //= 1 because of signature key
  unicodeEscapeSequence: false
};

module.exports = {
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
      minify: minifySettings,
      filename: "./html/about.html",
      template: "./src/html/about.html",
      chunks: ["about"],
      inlineSource: ".(js|css)$"
    }),
    new HtmlWebpackPlugin({
      minify: minifySettings,
      filename: "./html/index.html",
      template: "./src/html/index.html",
      chunks: ["upload"],
      inlineSource: ".(js|css)$"
    }),
    new HtmlWebpackPlugin({
      minify: minifySettings,
      filename: "./html/receive.html",
      template: "./src/html/receive.html",
      chunks: ["receive"],
      inlineSource: ".(js|css)$"
    }),
    new HtmlWebpackPlugin({
      minify: minifySettings,
      filename: "./html/history.html",
      template: "./src/html/history.html",
      chunks: ["history"],
      inlineSource: ".(js|css)$"
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new HtmlWebpackInlineSourcePlugin()
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../"
            }
          },
          "css-loader"
        ]
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src/js"),
          path.resolve(__dirname, "src/js/services")
        ],
        enforce: "post", //makes sure it's called after other loaders!
        use: {
          loader: "obfuscator-loader",
          options: obfuscatorSettings
        }
      }
    ]
  }
};
