var debug   = require("./debug")('tasks'),
    newTask = require('./task'),
    tasks   = {};

exports       = module.exports = tasks;
exports.add   = add;
exports.all   = all;
exports.alias = alias;

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

  var task     = add('all', undefined),
      children = Array.prototype.slice.call(arguments);

  process.nextTick(function(){

    children.forEach(function(taskName){

      if(!tasks[taskName]){
        debug('Ignoring not found task "%s"', taskName);
        return;
      }

      task.addChild(tasks[taskName]);
    });

  });

  return task;
}
