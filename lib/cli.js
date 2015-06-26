var debug = require("local-debug")('cli');
var style = require("style-format");
var generateDoc = require("./generate-doc");
var command = require('new-command')({
  w: 'watch',
  l: 'list',
  g: 'generate'
});

var params = readParams(command._);

var map = require("./map");

if (command.list) {
  return list();
}

if (command.generate) {
  return generate();
}

pick();

function list () {
  console.log(style('\n  {bold}{green}Tasks{reset} {grey}%s{reset}\n'), command._[0] || process.argv[1]);

  var key;
  for (key in map.tasks) {
    console.log(style('  {grey}❯{reset} {bold}%s{reset} {grey}%s{reset}'), key, map.get(key).name);
  }

  console.log('');
}

function generate () {
  var tasks = command._.map(function (el) {
    var parts = el.split(':');
    return {
      name: parts[0],
      module: parts[1] || parts[0]
    };
  });

  var target = command.generate;

  generateDoc(target, tasks, function (error) {
    if (error) throw error;
  });
}

function pick () {
  var tasks = command._;

  if (tasks.length == 0 && map.has('default')) {
    run(map.get('default'));
  } else if (tasks.length == 0) {
    return list();
  }

  tasks.forEach(function (key) {
    var t = map.get(key);

    if (!t) {
      debug('"%s" is not a recognized task.', key);
      return;
    }

    run(t);
  });
}

function run (t) {
  t.params = params;
  t.run(command.watch);
}

function readParams (args) {
  var params = {};
  var i = args.length;
  var parts;

  while (i--) {
    if (!/\w+\=\w+/.test(args[i])) continue;
    parts = args[i].split('=');
    params[parts[0]] = parts[1];
    args.splice(i, 1);
  }

  return params;
}
