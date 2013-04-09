var debug      = require('debug')('indev:run'),
    vm         = require("vm"),
    newContext = require('./context'),
    tasks      = require('./tasks');

module.exports = run;

function run(doc, callback){
  debug('Evaluating document "%s"', doc.filename);

  var context = newContext(doc.filename),
      src     = doc.content;

  vm.runInNewContext(src, context, doc.filename);

  process.nextTick(function(){

    debug('Running specified tasks: %s', tasks.specified.join(', '));

    if(~tasks.specified.indexOf('all'))
        return tasks.all && tasks.all.run ? tasks.all.run() : debug('"all" isn\'t defined yet.');

    tasks.specified.forEach(function(task){
      if(!tasks[task]) return debug('Ignoring unknown task "%s"', task);

      tasks[task].run();
    });

  });
}
