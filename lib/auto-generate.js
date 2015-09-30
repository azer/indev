var debug = require("local-debug")('auto-generate');
var install = require("install-module");
var format = require("format-text");
var variable = require("variable-name");
var loop = require("serial-loop");
var path = require("path");
var colored = require("style-format");
var fs = require("fs");
var QA = require("cli-qa");

module.exports = {
  document: document,
  save: save,
  dependencies: dependencies,
  parse: parse,
  task: task
};

function document (tasks, callback) {
  var top = head(tasks);
  var bottom = '';

  loop(tasks.length, each, function (error) {
    generateDefaultTasks(tasks, function (defaultTasks) {
      callback(error, top + defaultTasks + bottom);
    });
  });

  function each (next, i) {
    if (!tasks[i].module) {
      fail('Sorry, could not require "' + tasks[i].plugin + '" for the "' + tasks[i].task + '" task.');
      return next();
    }

    console.error(colored('\n  {bold}{cyan}%s {grey}< {green}%s{reset}{grey}:{reset}'), tasks[i].task, tasks[i].module.title);

    QA(createForm(tasks[i].module), { stdin: process.stdin, stdout: process.stderr }, function (answers) {
      bottom += '\n' + task({
        type: tasks[i].module.build ? 'build' : 'task',
        task: tasks[i].task,
        watch: answers.filesToWatch,
        ignore: answers.filesToIgnore,
        plugin: tasks[i].module.title,
        answers: answers
      });

      next();
    });
  }
}

function task (options) {
  return format('{type}("{task}"{watch}{ignore}, {plugin}({params}));', {
    type: options.type,
    task: options.task,
    watch: stringifyWatch(options),
    ignore: stringifyIgnore(options),
    plugin: variable(options.plugin),
    params: JSON.stringify(clearPluginParams(options.answers), null, "  ")
  });
}

function head (tasks) {
  return 'var task = require("bud");\nvar build = task;\n' +
    tasks.map(function (t) {
      return format('var {0} = require("{1}");\n', variable(t.module.title), t.plugin);
    })
    .join('\n');
}

function dependencies (tasks) {
  return tasks.map(function (t) {
    return t.plugin;
  });
}

function missingDependencies (tasks) {
  return ['bud'].concat(dependencies(tasks)).filter(function (name) {
    return name[0] != '.';
  });
}

function save (target, tasks, callback) {
  info('One moment, installing dependencies...');

  install(missingDependencies(tasks), { saveDev: true }, function (error) {
    if (error) {
      fail('Sorry, bud was unable to install dependencies.');
      return console.error(error);
    }

    document(tasks, function (error, doc) {
      if (error) {
        fail('Sorry, bud was unable to generate document.');
        return console.error(error);
      }

      write(target, doc, callback);
    });
  });
}

function write (target, doc, callback) {
  if (!fs.existsSync(target)) {
    info('Writing ' + target);
    return fs.writeFile(target, doc, callback);
  }

  QA([{ key: "filename", title: target + " already exists. Type the filename to save: " }], function (answers) {
    write(answers.filename, doc, callback);
  });
}

function createForm (plugin) {
  var form = [];

  if (!plugin.builtinWatch) {
    createFormRow({ key: 'filesToWatch', title: 'Watch', desc: 'e.g: *.jsx, lib/**/*.jsx', commaList: true }),
    createFormRow({ key: 'filesToIgnore', title: 'Ignore', desc: 'e.g: node_modules/**/*', commaList: true })
  };

  plugin.params.forEach(function (param) {
    form.push(createFormRow({
      key: param.key,
      title: param.title || param.name,
      desc: param.desc || param.description,
      list: param.list,
      commaList: param.commaList,
      bool: param.bool
    }));
  });

  return form;
}

function createFormRow (options) {
  var desc = '';

  if (options.desc) {
    desc = ' {reset}{grey}(' + options.desc.trim() + '){reset}{bold}';
  }

  var title = '{grey}> {reset}{bold}'
        + options.title
        + desc
        + ':{reset}';

  return {
    key: options.key || variable(options.title),
    title: title,
    list: options.list,
    commaList: options.commaList,
    bool: options.bool
  };
}

function generateDefaultTasks (tasks, callback) {
  QA([createFormRow({ title: 'Default Tasks', desc: 'e.g ' + defaultTaskExamples(tasks), commaList: true })], function (answers) {
    if (!answers.defaultTasks) return callback('');
    callback(format('\ntask("default", task.once("{0}"));\n', answers.defaultTasks.join('", "')));
  });
};

function defaultTaskExamples (tasks) {
  debugger;
  return tasks.slice(0, 3).map(function (t) {
    return t.task;
  });
}

function getPlugin (name) {
  var uri;

  if (name[0] == ".") {
    uri = path.join(process.cwd(), name);
  } else {
    uri = path.join(process.cwd(), 'node_modules', name);
  }

  debug('Getting plugin at %s', uri);

  try {
    return require(uri);
  } catch(err) {
    console.error(err);
  }
}

function parse (params) {
  return params.map(function (el) {
    var parts = el.split(':');
    var task = parts[0];
    var plugin = parts[1] || parts[0];

    return {
      task: task,
      plugin: plugin,
      module: getPlugin(plugin)
    };
  });
}

function stringifyWatch (options) {
  if (!options.watch || options.watch.length == 0) return '';

  return format(', {type}.watch("{files}")', {
    type: options.type,
    files: options.watch.join('", "')
  });
}

function stringifyIgnore (options) {
  if (!options.ignore || options.ignore.length == 0) return '';

  return format('{type}.ignore("{files}")', {
    type: options.watch ? '' : (', ' + options.type),
files: options.ignore.join('", "')
  });
}

function clearPluginParams (options) {
  delete options.filesToWatch;
  delete options.filesToIgnore;
  return options;
}

function fail (msg) {
  console.error(colored('  {red}! {grey}%s{reset}'), msg);
}

function info (msg) {
  console.error(colored('  {cyan}> {grey}%s{reset}'), msg);
}
