const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
  useShortDoctype: true,
};

const metaTags = {
  // Content-Security-Policy needs a lot of improvement!
  'Content-Security-Policy': { 'http-equiv': 'Content-Security-Policy', content: 'default-src \'self\' \'unsafe-eval\' \'unsafe-inline\' blob:;connect-src *;style-src \'unsafe-inline\' https://fonts.googleapis.com https://use.fontawesome.com; img-src * blob: data:; font-src \'self\' https://fonts.gstatic.com data:; frame-src https://www.youtube.com/ blob:' },
  description: 'Your Gateway to the Distributed Web',
  author: 'PACT Care BV',
  viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
};

module.exports = {
  mode: 'production',
  entry: {
    index: './src/js/index.js',
  },
  // devtool: "inline-source-map",
  output: {
    filename: '[name].bundle.js',
    publicPath: '',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Dweb.page',
      minify: minifySettings,
      meta: metaTags,
      filename: './html/index.html',
      template: './src/html/index.html',
      chunks: ['index'],
      inlineSource: '.(js|css)$',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
          },
          'css-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 20000, // Convert images < 20kb to base64 strings
          },
        }],
      },
    ],
  },
};
