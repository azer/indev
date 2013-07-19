var comp   = require('comp'),

    lookup = require('./lib/look-up'),
    find   = require('./lib/find'),
    read   = require('./lib/read'),
    run    = require('./lib/run'),
    tasks  = require('./lib/tasks'),

    indev  = comp(find, read, run);

module.exports = start;

function start(argv){
  process.stdout.write('\u001B[2J\u001B[0;0f');

  tasks.specified = argv._;

  if(argv.file) lookup.splice(0, 0, argv.file);

  indev(lookup, function(error){
    if(error) throw error;
  });

}
