var debug   = require("./debug")('start'),
    flatten = require('flatten-array'),
    fs      = require('fs'),
    exists  = fs.existsSync,
    shelljs = require('shelljs');

module.exports = start;

function isDirectory(filename){
  return fs.existsSync(filename) && fs.statSync(filename).isDirectory();
}

function onUpdate(filename, task){
  return function(curr, prev){
    debug('%s was changed.', filename);

    if(task.changed.indexOf(filename) == -1) task.changed.push(filename);
    if(task.exec.timeout != undefined) clearTimeout(task.exec.timeout);

    task.exec.timeout = setTimeout(task.exec, 100);
  };
}

function start(task){
  var timeout;

  task.changed = flatten(task.observe
    .map(function(path){
      if(!isDirectory(path)) return path;
      return shelljs.ls(path);
    }));

  task.exec();

  watch(task);
}

function watch(task){
  task.observe.forEach(function(filename){

    if(!fs.existsSync(filename)) {
      debug('Ignoring unexisting file "%s" in %s', filename, process.cwd());
    }

    debug('Watching changes on %s for %s', filename, task.name);

    fs.watchFile(filename, { persistent: true, interval: 1000 }, onUpdate(filename, task));
  });
}
