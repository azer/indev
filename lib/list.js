var comp     = require('comp'),
    style    = require('styled'),

    lookup   = require('./look-up'),
    find     = require('./find'),
    read     = require('./read'),
    evaluate = require('./run').evaluate,
    tasks    = require('./tasks'),

    list     = comp(find, read, evaluate);

list(lookup, function(){
  var output, key;

  output = [
    style.grey('\n  Available tasks/targets:')
  ];

  for(key in tasks){
    if(!tasks[key].isTask) continue;

    output.push(style.grey('    > ') + style.cyan(key));
  }

  output.push('\n');

  process.stdout.write(output.join('\n'));

  process.exit();
});
