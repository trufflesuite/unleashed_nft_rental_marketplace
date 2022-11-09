const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const config = {
  mode: "development",
  entry: "./src/index.jsx",
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      buffer: require.resolve("buffer/"),
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      assert: require.resolve("assert/"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      url: require.resolve("url/"),
    },
  },
  devtool: "source-map",
  devServer: {
    port: 3000,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: [/\.jsx?$/, /\.tsx?$/],
        use: ["babel-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.png$/,
        type: "asset/resource",
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};

module.exports = config;
