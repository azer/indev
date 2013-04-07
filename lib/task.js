var debug   = require("debug")('indev:task'),
    fs      = require("fs"),
    partial = require('new-partial'),
    iter    = require('iter'),
    shelljs = require('shelljs'),
    slice   = Array.prototype.slice;

module.exports = Task;

function Task(name){

  debug('New task "%s"', name);

  var task = {
    children : [],
    name     : name,
    observe  : slice.call(arguments, 1, arguments.length - 1),
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

  task.fn && task.fn(task);

  task.exec.timeout = undefined;
}


function run(task){

  shelljs.cd(process.cwd());

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

  task.observe.forEach(function(filename){

    if(!fs.existsSync(filename)){
      debug('Ignoring unexisting file "%s"', filename);
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
