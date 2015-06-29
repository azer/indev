var debug = require("local-debug")('watch');
var debounce = require("debounce-fn");
var watchFiles = require("chokidar").watch;
var expand = require("./expand");

module.exports = watch;

function watch (task, callback) {
  if (task.watching) return callback();

  task.watching = true;

  expand.task(task, function (error) {
    if (error) return callback(error);
    if (!task.files) return callback();

    debug('Watching changes on %s\'s files: %s (Total: %d files)', task.key, task.files.slice(0, 5).join(', '), task.files.length);

    var watcher = watchFiles(task.files, { persistent: true });

    watcher.on('change', debounce(function () {
      debug('Restarting %s after the changes', task.key);
      task.run(false, true);
    }, 250));

    callback(undefined, watcher);
  });
}
