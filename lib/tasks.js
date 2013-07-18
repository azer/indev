var debug   = require("./debug")('tasks'),
    newTask = require('./task'),
    exec    = require('./exec'),
    tasks   = {};

exports       = module.exports = tasks;
exports.add   = add;
exports.all   = all;
exports.alias = alias;
exports.bin   = bin;

function add(name){
  debug('Adding %s', name);
  return tasks[name] = newTask.apply(this, arguments);
}

function alias(name){
  var task     = add(name, undefined),
      children = Array.prototype.slice.call(arguments, 1);

  debug('New alias %s', name);

  process.nextTick(function(){
    children.forEach(function(taskName){
      if(!tasks[taskName]) {
        debug('Ignoring not found task "%s"', taskName);
        return;
      }

      task.addChild(tasks[taskName]);
    });
  });

  return task;
}

function all(){
  return alias.apply(null, ['all'].concat(Array.prototype.slice.call(arguments)));
}

function bin(name){
  var cmd    = './node_modules/',
      params = Array.prototype.slice.call(arguments, 1);

  if(name.indexOf(' ') > -1){
    name = name.split(' ');
    params = name.slice(1).concat(params);
    name = name[0];
  }

  var slashAt = name.indexOf('/');
  if ( slashAt > -1 ) {
    cmd += name.slice(0, slashAt);
    name = name.slice(slashAt + 1);
    cmd += '/bin/' + name;
  } else {
    cmd += name;
    cmd += '/bin/' + name;
  }

  params.length && ( cmd += ' ' + params.join(' ') );

  debug('Defined %s as %s', name, cmd);

  function run(){
    if(arguments.length) {
      exec(cmd + ' ' + Array.prototype.slice.call(arguments).join(' '));
      return;
    }

    exec(cmd);
  };

  run.isBinCommand = true;

  return run;
}
