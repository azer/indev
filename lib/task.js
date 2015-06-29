var Struct = require("new-struct");

var debug = require("local-debug")('task');

var format = require("format-text");
var rightpad = require("right-pad");
var style = require("style-format");
var through = require("through");
var prettifyError = require("prettify-error");
var debounce = require("debounce-fn");
var pubsub = require("pubsub");

var Options = require("./options");
var map = require("./map");
var run = require("./run");
var exec = require("./exec");
var watch = require("./watch");

var Task = Struct({
  New: New,
  done: done,
  run: run,
  watch: watch,
  exec: exec,
  error: error,
  fail: fail,
  subscribeTo: subscribeTo,
  debouncedRun: debounce(run)
});

var colors = [
  'red',
  'green',
  'cyan',
  'magenta'
];

module.exports = Task;

function New (name, options, fn) {
  if (arguments.length == 2 && typeof options == 'function') {
    fn = options;
    options = Options.New();
  }

  debug('Created new task "%s"%s', name, options && options._watch ? (' watching ' + options._watch.join(',')) : '');

  var task = map.set(name, Task({
    name: name,
    key: map.slug(name),
    options: options,
    fn: fn,
    done: done,
    color: nextColor(),
    processes: [],
    params: {},
    info: info,
    onAfterRun: pubsub(),
    tasks: map
  }));

  stdout();
  stderr();

  if (options._when) {
    task.subscribeTo(options._when);
  }

  return task;

  function stdout () {
    if (task.stdout) {
      task.stdout.destroy();
      delete task.stdout;
    }

    task.stdout = std(task, stdout);
    task.stdout.pipe(process.stdout);
  }

  function stderr () {
    if (task.stderr) {
      task.stderr.destroy();
      delete task.stderr;
    }

    task.stderr = std(task, stderr);
    task.stderr.pipe(process.stderr);
  }
}

function std (task, callback) {
  var ts = through(function (line) {
    this.queue(beautify(task, line));
  }, callback);

  return ts;
}

function done (task) {
  var diff = Date.now() - task.startTS;

  task.info(task, 'Completed in {0}', humanize(diff));

  task.onDone.publish();
  delete task.onDone;
  delete task.startTS;

  task.onAfterRun.publish();
}

function fail (task) {
  if (task.failed) return;
  task.failed = true;

  var diff = Date.now() - task.startTS;

  task.info(task, 'Failed in {0}', humanize(diff));

  task.onDone.publish();
  delete task.onDone;
  delete task.startTS;

  task.onAfterRun.publish();
}

function humanize (ms) {
  var sec = 1000;
  var min = 60 * 1000;
  var hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';

  return ms + 'ms';
};

function nextColor () {
  if (colors.next == undefined)
    colors.next = 0;
  else
    colors.next++;

  return colors[colors.next % colors.length];
}

function info (task, message, context) {
  var text = format.apply(undefined, Array.prototype.slice.call(arguments, 1));
  var key = rightpad(task.key, map.len);
  console.log(style(format('    {' + task.color + '}' + key + '{reset}  {grey}' + text + '{reset}')));
}

function error (task, error) {
  var output = prettifyError(error) || error.message;

  output = output.split('\n').map(function (line) {
    var i = map.len;
    while (i--) {
      line = ' ' + line;
    }

    return '  ' + line;
  }).join('\n');

  console.log('');
  task.info(task, 'Failed to run this task due to the following error:');
  console.error('\n    %s', output);

  task.fail();
}

function beautify (task, line) {
  var key = rightpad(task.key, map.len);

  return style(format('    {color}{key}{reset} {line}', {
    color: '{' + task.color + '}',
    line: line.toString(),
    key: key
  })) + '\n';
}

function subscribeTo (task, tasks) {
  tasks.forEach(function (name) {
    var t = map.get(name);

    if (!t) {
      info(task, 'Cannot subscribe to non existing task ' + name);
      return;
    }

    t.onAfterRun.subscribe(task.debouncedRun);
  });
}
