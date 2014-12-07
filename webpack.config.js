var os = require('os');
var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var nib = require('nib');
var jeet = require('jeet');

var jsName = '[name].js';
if (process.env.NODE_ENV === 'production') {
  jsName = '[name]-[chunkhash].js';
}

function regexpEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

var config = {
  entry: {
    app: [
      './src/styles/main.styl',
      './src/main'
    ],
    libs: [
      'react',
      'react/lib/ReactComponentWithPureRenderMixin',
      'bezier-easing',
      'reflux',
      'debounce',
      'immutable'
    ]
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: jsName,
    publicPath: '/build/'
  },
  resolve: {
    extensions: ['', '.js']
  },
  stylus: {
    use: [nib(), jeet()]
  },
  bail: process.env.NODE_ENV === 'production',
  module: {
    loaders: [
      {
        test: /\.yml$/,
        loaders: ['json', 'yaml'],
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.styl$/,
        loaders: [
          'style',
          'css',
          'autoprefixer',
          'stylus'
        ]
      },
      {
        test: /\.css$/,
        loaders: [
          'style',
          'css'
        ]
      },
      {
       test: /\.(ttf|woff|woff2|eot|svg|gif|png|jpg|mp3|mp4|webm|ogg)(\?.+)?$/,
       loader: 'file-loader?name=[sha512:hash:base36:7].[ext]'
      },
      {
        inject: 'hot',
        test: new RegExp('^' + regexpEscape(path.join(__dirname, 'src')) + '.+\\.jsx?$'),
        loaders: [
          'jsx?harmony'
        ]
      },
    ],
    postLoaders: [{
      loader: 'transform/cacheable?envify'
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('libs', jsName),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru/),
    new webpack.NoErrorsPlugin()
  ]
};

if (process.env.NODE_ENV === 'production') {

  config.devtool = 'sourcemap';
  config.output.devtoolModuleFilenameTemplate = "file://[absolute-resource-path]";
  config.output.devtoolFallbackModuleFilenameTemplate = "file://[absolute-resource-path]?[hash]";

  config.plugins.unshift(
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({comments: /a^/})
  );

} else {

  config.devtool = 'inline-sourcemap';

  _.find(config.module.loaders, function(loader) {
    return loader.inject === 'hot';
  }).loaders.unshift('react-hot');

  config.entry.app.unshift(
    'webpack-dev-server/client?http://' + os.hostname() + ':' + (parseInt(process.env.PORT || '3000', 10)),
    'webpack/hot/dev-server'
  );

  config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = config;
