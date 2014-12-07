#!/usr/bin/env node

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  watchDelay: 300,
  hot: true,
  stats: {
    colors: true,
    assets: true,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false,
    children: false
  }
}).listen(parseInt(process.env.PORT || '3000', 10), '0.0.0.0', function (err, result) {
  if (err) {
    console.log(err);
  }
});
