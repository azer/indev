var debug = require("local-debug")('cli');
var style = require("style-format");
var command = require('new-command')({
  w: 'watch',
  l: 'list'
});

var map = require("./map");

if (command.list) {
  return list();
}

pick();

function list () {
  console.log(style('\n  {bold}{green}Tasks{reset} {grey}%s{reset}\n'), command._[0] || process.argv[1]);

  var key;
  for (key in map) {
    console.log(style('  {grey}❯{reset} {bold}%s{reset} {grey}%s{reset}'), key, map[key].name);
  }

  console.log('');
}

function pick () {
  var tasks = command._;

  if (tasks.length == 0 && map['default']) {
    run(map['default']);
  }

  tasks.forEach(function (key) {
    var t = map[key];

    if (!t) {
      debug('"%s" is not a recognized task.', key);
      return;
    }

    run(t);
  });
}

function run (t) {
  t.run(command.watch);
}
