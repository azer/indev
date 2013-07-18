var debug   = require("./debug")('task'),
    fs      = require("fs"),
    partial = require('new-partial'),
    flatten = require('flatten-array'),
    glob    = require('glob').sync,
    iter    = require('iter'),
    shelljs = require('shelljs'),
    start   = require('./start'),
    slice   = Array.prototype.slice;

module.exports = Task;

function Task(name){
  var observe;

  observe = flatten(slice.call(arguments, 1, arguments.length - 1)
                    .map(function(filename){
                      return glob(filename);
                    }));

  debug('New task "%s"%s', name, observe.length ? ' will be observing ' + observe.join(',') : '');

  var task = {
    changed  : undefined,
    children : [],
    isTask   : true,
    name     : name,
    observe  : observe,
    fn       : slice.call(arguments, -1)[0],
    wd       : process.cwd()
  };

  task.addChild = partial(addChild, task);
  task.exec     = partial(exec, task);
  task.start    = partial(start, task);
  task.run      = partial(run, task);

  return task;
}

function addChild(parent, child){
  debug('Setting child task %s: %s', parent.name, child.name);
  parent.children.push(child);
}

function exec(task){
  debug('Running task "%s"', task.name);

  shelljs.cd(task.wd);

  if (task.fn) {
    task.fn.isBinCommand ? task.fn() : task.fn(task.changed.splice(0));
  }

  task.exec.timeout = undefined;
}

function run(task){
  shelljs.cd(task.wd);

  iter(task.children.length, function(next, i){
    var child = task.children[i];
    child.run();

    process.nextTick(next);
  });

  task.start();
}
