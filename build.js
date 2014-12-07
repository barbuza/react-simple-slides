var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var zlib = bluebird.promisifyAll(require('zlib'));
var colors = require('colors/safe');
var webpack = require('webpack');
var path = require('path');
var htmlMinifier = require('html-minifier');
var webpackConfig = require('./webpack.config.js');

var packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));

var compiler = webpack(webpackConfig);

var compressibleTypes = /\.(?:html|js|css|map)$/;


var htmlMinifierOptions = {
  removeComments: true,
  collapseWhitespace: true,
  minifyJS: true,
  minifyCSS: true,
  keepClosingSlash: false,
  removeAttributeQuotes: true
};


function logFile(filename, message) {
  filename = path.relative(__dirname, path.resolve(filename));
  console.log(colors.yellow('[' + message + ']'), filename);
}


function assetPath(filename) {
  return path.join(webpackConfig.output.path, filename);
}


function gzip(filename) {
  if (packageJSON.build.gzip) {
    var gzipName = filename + '.gz';
    return fs.readFileAsync(filename)
      .then(function(raw) {
        return zlib.gzipAsync(raw);
      })
      .then(function(compressed) {
        return fs.writeFileAsync(gzipName, compressed);
      })
      .then(function() {
        logFile(gzipName, 'gzip');
        return filename;
      });
  } else {
    return filename;
  }
}


function buildHtml(javascripts, htmlSourceName) {
  var htmlName = path.resolve(path.join(webpackConfig.output.path, htmlSourceName));
  return fs.readFileAsync(htmlSourceName)
    .then(function(htmlStream) {

      var html = javascripts.reduce(function(html, asset) {
        var filename = assetPath(asset.chunkNames[0] + '.js');
        var sourceName = path.relative(path.dirname(htmlSourceName), path.resolve(filename));
        var buildName = path.relative(path.dirname(htmlName), assetPath(asset.name));
        return html.replace(sourceName, buildName);
      }, htmlStream.toString());

      var compressed;
      if (packageJSON.build.minify) {
        compressed = htmlMinifier.minify(html, htmlMinifierOptions);
      } else {
        compressed = html;
      }

      logFile(htmlName, 'minify');
      return fs.writeFileAsync(htmlName, compressed);
    }).then(function() {
      return htmlName;
    });
}


compiler.run(function(err, stats) {
  if (err) {
    console.log('💩 💩 💩');
    console.log(colors.red(
      err.message +
      '\n' +
      'request: ' +
      err.module.userRequest
    ));
    process.exit(-1);
  }

  var assets = stats.toJson().assets;

  var filenames = assets.map(function(asset) {
    return path.join(webpackConfig.output.path, asset.name);
  });

  filenames.forEach(function(filename) {
    logFile(filename, 'build');
  });

  var compressibleFiles = filenames.filter(function(filename) {
    return compressibleTypes.test(filename);
  });

  var javascripts = assets.filter(function(asset) {
    return /\.js$/.test(asset.name) && asset.chunkNames.length === 1;
  });

  bluebird.join(
    bluebird.all(compressibleFiles.map(gzip)),
    buildHtml(javascripts, 'index.html').then(gzip)
  ).then(function() {
    console.log(colors.green('done'));
  }).catch(function(err) {
    console.log('💩 💩 💩');
    console.log(colors.red(err.stack));
    process.exit(-1);
  });

});
