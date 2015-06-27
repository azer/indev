var exec = require("child_process").exec;
var format = require("style-format");
var loop = require("serial-loop");
var prompt = require("prompt-input")();
var variableName = require("variable-name");
var path = require("path");
var fs = require("fs");

module.exports = save;

function generate (tasks, callback) {
  var taskNames = [];

  loop(tasks.length, each, function (error) {
    // ignore errors

    prompt(option("What's the default task(s)?", taskNames.join(', ')), function (answer) {
      answer = answer.trim();

      var def = '';

      if (answer.trim()) {
        def = defaultTask(answer.trim().split(/,\s*/));
      }

      callback(undefined, generateTop(tasks) + def + generateBody(tasks));
    });
  });

  function each (done, index) {
    install(tasks[index], done);
  }
}

function save (target, tasks, callback) {
  generate(tasks, function (error, doc) {
    if (error) return callback(error);

    if (!fs.existsSync(target)) return write(target, doc, callback);

    prompt(target + ' already exists. Type the filename to write again please:', function (answer) {
      write(answer.trim(), doc, callback);
    });
  });
}

function write (target, doc, callback) {
  info('Writing ' + target);
  fs.writeFile(target, doc, callback);
}

function fail (msg) {
  console.log(format('  {red}! {grey}%s{reset}'), msg);
}

function info (msg) {
  console.log(format('  {cyan}> {grey}%s{reset}'), msg);
}

function install (task, callback) {
  info('Installing ' + task.module);

  exec('npm install --save-dev ' + task.module, function (error, stdout, stderr) {
    if (error) {
      fail('Unable to install ' + task.module);
      return callback(error);
    }

    var lookup = path.join(process.cwd(), 'node_modules', task.module);
    try {
      task.plugin = require(lookup);
    } catch (err) {
      console.error(err);
      fail('Can not access the ' + task.module + ' plugin. Makes sure %s exists.', lookup);
      return callback();
    }

    var options = {
      watch: option('Watch for changes', 'e.g: **/*.js, node_modules'),
      ignore: option('Ignore for changes', 'e.g: **/*.js, node_modules')
    };

    task.plugin.params && task.plugin.params.forEach(function (p, index) {
      options['p' + index] = option(p.name || p, p.description || p.desc);
    });

    console.log(format('\n  {bold}{green}%s{reset} {grey}(%s){green}:{reset}'), task.plugin.title || task.module, task.name);

    prompt(options, function (answers) {
      var watch = answers.watch.trim();
      var ignore = answers.ignore.trim();

      task.watch = watch ? watch.split(/,\s*/) : undefined;
      task.ignore = ignore ? ignore.split(/,\s*/) : undefined;

      task.plugin.params && (task.params = task.plugin.params.map(function (p, index) {
        return answers['p' + index];
      }));

      callback(undefined, task);
    });
  });
}

function option (title, description) {
  if (description && description.trim().length) {
    description = ' {reset}{grey}(' + description.trim() + '){reset}{bold}';
  } else {
    description = '';
  }

  return '{grey}> {reset}{bold}' + title + description + ':{reset}';
}

function variable (name) {
  return variableName(name.replace('bud-', ''));
}

function parametrify (list) {
  return list.map(function (p) {
    if (/^\d+$/.test(p)) return p;
    return '"' + p + '"';
  }).join(', ');
}

function generateTop (tasks) {
  var top = 'var task = require("bud");\nvar build = task;';

  tasks.forEach(function (t) {
    if (!t.plugin) return;
    top += '\nvar ' + variable(t.module) + ' = require("' + t.module + '");';
  });

  return top;
}

function generateBody (tasks) {
  var body = '';

  tasks.forEach(function (t) {
    if (!t.plugin) return;

    var alias = (t.plugin.build ? 'build' : 'task');

    body += '\n\n' + alias + '("' + t.name + '"';

    t.watch && (body += ", " + alias + ".watch(" + parametrify(t.watch) + ")");
    t.ignore && (body += (t.watch ? "" : ", " + alias) + ".ignore(" + parametrify(t.ignore) + ")");

    body += ", " + variable(t.module) + '(' + parametrify(t.params) + ')';
    body += ');';
  });

  return body;
}

function defaultTask (tasks) {
  return '\n\ntask("default", task.once(' + parametrify(tasks) + '));';
}
