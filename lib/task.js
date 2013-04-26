var debug   = require("./debug")('task'),
    fs      = require("fs"),
    partial = require('new-partial'),
    flatten = require('flatten-array'),
    glob    = require('glob').sync,
    iter    = require('iter'),
    shelljs = require('shelljs'),
    slice   = Array.prototype.slice,
    wd      = process.cwd();

module.exports = Task;

function Task(name){
  var observe;

  observe = flatten(slice
                    .call(arguments, 1, arguments.length - 1)
                    .map(function(filename){
                      return glob(filename);
                    }));

  debug('New task "%s"%s', name, observe.length ? ' will be observing ' + observe.join(',') : '');

  var task = {
    children : [],
    name     : name,
    observe  : observe,
    fn       : slice.call(arguments, -1)[0]
  };

  task.addChild = partial(addChild, task);
  task.exec     = partial(exec, task);
  task.start    = partial(start, task);
  task.run      = partial(run, task);

  return task;
}

function addChild(parent, child){
  debug('Adding new child %s: %s', parent.name, child.name);
  parent.children.push(child);
}

function exec(task){
  debug('Running task "%s"', task.name);

  shelljs.cd(wd);

  task.fn && task.fn(task.observe);

  task.exec.timeout = undefined;
}

function run(task){
  shelljs.cd(wd);

  iter(task.children.length, function(next, i){
    var child = task.children[i];
    child.run();

    process.nextTick(next);
  });

  task.start();
}

function start(task){
  var timeout;

  task.exec();

  shelljs.cd(wd);

  task.observe.forEach(function(filename){

    if(!fs.existsSync(filename)){
      debug('Ignoring unexisting file "%s" in %s', filename, process.cwd());
      return;
    }

    debug('Watching changes on %s for %s', filename, task.name);

    fs.watch(filename, onUpdate);
  });

  function onUpdate(){

    if(task.exec.timeout != undefined){
      clearTimeout(task.exec.timeout);
    }

    task.exec.timeout = setTimeout(task.exec, 100);

  }

}
