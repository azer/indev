var debug      = require('./debug')('run'),
    vm         = require("vm"),
    newContext = require('./context'),
    taskList   = require('./task-list'),
    tasks      = require('./tasks');

module.exports = run;
module.exports.evaluate = evaluate;

function evaluate(doc, callback){
  var context = newContext(doc.filename),
      src     = doc.content;

  vm.runInNewContext(src, context, doc.filename);

  callback && process.nextTick(callback);
}

function run(doc, callback){
  debug('Evaluating document "%s"', doc.filename);
  evaluate(doc);

  process.nextTick(function(){
    if(tasks.specified.length){
      runSpecifiedTasks(tasks.specified);
      return;
    }

    taskList(function(task){
      runSpecifiedTasks([task]);
    });

  });
}

function runSpecifiedTasks(specified){
  debug('Running specified tasks: %s', specified.join(', '));

  specified.forEach(function(task){
    if(!tasks[task]) return debug('Ignoring unknown task "%s"', task);

    tasks[task].run();
  });

}
