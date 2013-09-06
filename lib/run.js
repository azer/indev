var debug      = require('./debug')('run'),
    Q          = require('q'),
    vm         = require("vm"),
    newContext = require('./context'),
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
    debug('Running specified tasks: %s', tasks.specified.join(', '));

    if(~tasks.specified.indexOf('all'))
        return tasks.all && tasks.all.run ? tasks.all.run() : debug('"all" isn\'t defined yet.');

    var promise = Q();
    tasks.specified.forEach(function(task){
      if(!tasks[task]) return debug('Ignoring unknown task "%s"', task);

      promise = promise.then(function() {
        return tasks[task].run();
      });
    });

  });
}
