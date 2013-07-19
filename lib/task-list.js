var List  = require("term-list"),
    tasks = require('./tasks');

module.exports = show;

function show(callback){
  var list = new List({
    marker: '\033[36m› \033[0m',
    markerLength: 2
  });

  Object.keys(tasks).filter(function(e){ return tasks[e].isTask; }).forEach(function(task){
    list.add(task, task);
  });

  list.on('keypress', function(key, item){
    switch (key.name) {
      case 'return':
        list.stop();
        callback(item);
        break;
    }
  });

  list.on('empty', function(){
    list.stop();
    callback();
  });

  list.start();
}
