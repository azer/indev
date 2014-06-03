var Struct = require("new-struct");

var pubsub = require("pubsub");
var debug = require("local-debug")('task');
var loop = require("parallel-loop");
var serialLoop = require("serial-loop");
var format = require("format-text");
var style = require("style-format");
var rightpad = require("right-pad");
var watchFiles = require("chokidar").watch;
var child_process = require("child_process");
var through = require("through");
var byline = require("byline");
var path = require("path");
var fs = require("fs");
var readJSON = require("read-json");

var Options = require("./options");
var map = require("./map");

var longestKey = 0;

var Task = Struct({
  New: New,
  done: done,
  run: run,
  watch: watch,
  exec: exec
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

  var key = slug(name);

  if (key.length > longestKey) longestKey = key.length;

  return map[key] = Task({
    name: name,
    key: key,
    options: options,
    fn: fn,
    done: done,
    color: nextColor(),
    processes: []
  });
}

function done (task) {
  var diff = Date.now() - task.startTS;

  info(task, 'Completed in {0}', humanize(diff));

  task.onDone.publish();
  delete task.onDone;
  delete task.startTS;
}

function run (task, watch, restart, callback) {
  info(task, 'Running...');

  if (typeof watch == 'function') {
    callback = watch;
    watch = undefined;
  }

  if (typeof restart == 'function') {
    callback = restart;
    restart = undefined;
  }

  task.startTS = Date.now();

  killRunningProcesses(task);

  runDependentsFirst(task, restart, function (error) {
    if (error) return callback(error);

    expandFilesIfNecessary(task, function (error) {
      if (error) return callback(error);

      task.options._once && task.options._once.forEach(function (name) {
        var t = map[slug(name)];
        if (!t) return;
        if (!task.files) task.files = [];
        task.files = task.files.concat(t.files);
      });

      if (restart) {
        task.onDone = undefined;
      }

      if (task.onDone) return task.onDone.subscribe(callback);

      task.onDone = pubsub();
      task.onDone.subscribe(callback);

      if (watch) {
        task.watch();
      }

      if (!task.fn) {
        return task.done();
      }

      task.fn(task);
    });

  });
}

function runDependentsFirst (task, restart, callback) {
  if (!task.options._once || !task.options._once.length) return callback();

  loop(task.options._once.length, each, callback);

  function each (done, i) {
    var t = map[slug(task.options._once[i])];

    if (!t) {
      debug('"%s" is not a valid task. Valid tasks: %s', task.options._once[i], Object.keys(map).join(','));
      return done();
    }

    t.run(false, restart, done);
  }
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

function slug (title) {
  return title.replace(/\s/g, '-');
}

function info (task, message, context) {
  console.log(style(format('    {'+task.color+'}' + rightpad(task.key, longestKey) + '{reset}  {grey}' + format.apply(undefined, Array.prototype.slice.call(arguments, 1)) + '{reset}')));
}

function exec (task, firstCommand) {
  var commands = [firstCommand];

  process.nextTick(run);

  return { then: then };

  function then (command) {
    commands.push(command);
    return { then: then };
  }

  function run () {
    serialLoop(commands.length, each, function () {});
  }

  function each (done, i) {
    var cmd = commands[i];

    if (typeof cmd == 'function') {
      cmd();
      return done();
    }

    debug('%s spawns %s', task.key, cmd);
    info(task, 'Executing "{0}"', cmd);

    var parts = cmd.split(' ');
    var name = parts[0];
    var args = parts.slice(1);
    var child;

    preferLocalBin(name, function (preferredName) {
      child = child_process.spawn(preferredName, args);

      task.processes.push(child);

      debug('Added %d to the processes of %s', child.pid, task.key);

      byline(child.stdout).pipe(through(beautify)).pipe(process.stdout);
      byline(child.stderr).pipe(through(beautify)).pipe(process.stderr);

      child.on('error', function (error) {
        console.error(style('    {red}Error:{reset} Failed to run %s: %s'), cmd, error.toString());
      });

      child.on('close', done);
    });

    function beautify (data) {
      var str = data.toString();
      var c = cmd;

      if (c.length > 13) {
        c = c.slice(0, 7).trim() + '...' + c.slice(-7).trim();
      }

      this.queue(style('    {'+task.color+'}' + rightpad(task.key, longestKey) + '{reset}  {grey}('+ child.pid + ':' + c +'){reset}  ' + data + '\n'));
    }
  }
}

function watch (task) {
  if (!task.files) return;

  debug('Watching changes on %s\'s files: %s (Total: %d files)', task.key, task.files.slice(0, 5).join(', '), task.files.length);

  var watcher = watchFiles(task.files, { persistent: true });

  watcher.on('change', delay(function () {
    debug('Restarting %s after the changes', task.key);
    task.run(false, true);
  }, 250));

  return watcher;
}

function nextColor () {
  if (colors.next == undefined)
    colors.next = 0;
  else
    colors.next++;

  return colors[colors.next % colors.length];
}

function killRunningProcesses (task) {
  task.processes.forEach(function (proc) {
    debug('Killing %s', proc.pid);
    proc.kill();
  });

  task.processes = [];
}

function expandFilesIfNecessary (task, callback) {
  if (task.files) return callback();

  debug('Expanding %s', task.options._watch);

  task.options.expand(function (error) {
    if (error) return callback(error);
    task.files = task.options.files;
    callback();
  });
}

function delay (fn, ms) {
  var timer;

  return function () {
    if (timer != undefined) {
      clearTimeout(timer);
      timer = undefined;
    }

    timer = setTimeout(fn, ms);
  };
}

function preferLocalBin (name, callback) {
  var lookup = [
    './node_modules/' + name + '/package.json',
    '../node_modules/' + name + '/package.json',
    '../../node_modules/' + name + '/package.json'
  ];

  var manifest;
  var dir;

  serialLoop(lookup.length, each, function () {
    return callback(name);
  });

  function each (done, index) {
    var filename = lookup[index];

    fs.exists(filename, function (exists) {
      if (!exists) return done();

      readJSON(filename, function (error, manifest) {
        if (error) return done();

        dir = path.dirname(filename);

        if (!manifest || !manifest.bin || !manifest.bin[name]) return done();

        var resolved = dir + '/' + path.join(manifest.bin[name]);
        debug('Command %s resolved as %s', name, resolved);

        return callback(resolved);

      });
    });
  }
}
