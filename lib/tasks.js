var debug   = require("./debug")('tasks'),
    newTask = require('./task'),
    tasks   = {};

exports = module.exports = tasks;
exports.add = add;
exports.all = all;

function add(name){
  debug('Adding %s', name);
  return tasks[name] = newTask.apply(this, arguments);
}

function all(){
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
