var comp   = require('comp'),

    lookup = require('./lib/look-up'),
    find   = require('./lib/find'),
    read   = require('./lib/read'),
    run    = require('./lib/run'),
    tasks  = require('./lib/tasks'),

    bud    = comp(find, read, run);

module.exports = start;

function start(argv){
  process.stdout.write('\u001B[2J\u001B[0;0f');

  tasks.specified = argv._;
  tasks.specified.length == 0 && tasks.specified.push('all');

  if(argv.file) lookup.splice(0, 0, argv.file);

  bud(lookup, function(error){
    if(error) throw error;
  });

}
