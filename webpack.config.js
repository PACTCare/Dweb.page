const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    about: "./src/js/about.js",
    load: "./src/js/load.js",
    upload: "./src/js/upload.js",
    alert: "./src/js/alert.js"
  },
  //devtool: "inline-source-map",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist/js")
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "../about.html",
      template: "./src/html/about.html",
      chunks: ["about"],
      minify: { collapseWhitespace: true }
    }),
    new HtmlWebpackPlugin({
      filename: "../upload.html",
      template: "./src/html/upload.html",
      chunks: ["upload"],
      minify: { collapseWhitespace: true }
    }),
    new HtmlWebpackPlugin({
      filename: "../receive.html",
      template: "./src/html/receive.html",
      chunks: ["load"],
      minify: { collapseWhitespace: true }
    }),
    new HtmlWebpackPlugin({
      filename: "../index.html",
      template: "./src/html/index.html",
      inject: false,
      minify: { collapseWhitespace: true }
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  mode: "production"
};
