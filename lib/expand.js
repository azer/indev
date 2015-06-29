var debug = require("local-debug")('expand');
var parallel = require("parallel-loop");
var glob = require("glob");
var minimatch = require("minimatch");

module.exports = {
  options: options,
  task: task
};

function options (options, callback) {
  if (!options._watch || !options._watch.length) return callback();
  if (options.files) return callback();

  debug('Expanding %s', options._watch.join(','));

  resolveFilePatterns(options._watch, function (error, filenames) {
    if (error) return callback(error);

    if (!options._ignore) {
      options.files = filenames;
      return callback();
    }

    options.files = filenames.filter(function (filename) {
      return options._ignore.every(function (pattern) {
        return !minimatch(filename, pattern);
      });
    });

    callback();
  });
}

function task (t, callback) {
  if (t.files) return callback();

  debug('Expanding %s', t.options._watch || 'n/a');

  t.options.expand(function (error) {
    if (error) return callback(error);
    t.files = t.options.files;
    callback();
  });
}

function resolveFilePatterns (patterns, callback) {
  var result = [];

  parallel(patterns.length, each, function () {
    callback(undefined, result);
  });

  function each (done, index) {
    glob(patterns[index], function (error, files) {
      if (error) return done(error);
      result = result.concat(files);
      done();
    });
  }
}
