var test = require("prova");
var autoGenerate = require("../lib/auto-generate");
var parse = autoGenerate.parse;
var dependencies = autoGenerate.dependencies;
var task = autoGenerate.task;

test('parse task & plugin parameters', function (t) {
  t.plan(8);

  var parsed = parse(['dist/build.js:bud-babelify', 'dist/build.css:bud-concat', 'dist/index.html:bud-indexhtml', 'serve:bud-serve']);

  t.equal(parsed[0].task, "dist/build.js");
  t.equal(parsed[0].plugin, "bud-babelify");

  t.equal(parsed[1].task, "dist/build.css");
  t.equal(parsed[1].plugin, "bud-concat");

  t.equal(parsed[2].task, "dist/index.html");
  t.equal(parsed[2].plugin, "bud-indexhtml");

  t.equal(parsed[3].task, "serve");
  t.equal(parsed[3].plugin, "bud-serve");
});

test('resolving dependencies to install', function (t) {
  t.plan(1);

  var deps = dependencies(parse(['dist/build.js:bud-babelify', 'dist/build.css:bud-concat', 'dist/index.html:bud-indexhtml', 'serve:bud-serve', 'foo:./']));
  t.deepEqual(deps, ['bud-babelify', 'bud-concat', 'bud-indexhtml', 'bud-serve', './']);
});

test('generating task', function (t) {
  var options = {
    type: 'build',
    task: 'foo/bar.js',
    plugin: 'do-something',
    watch: ['**/*.js', '**/*.css'],
    ignore: ['node_modules/**/*', 'test/**/*'],
    params: { yo: 'lo' }
  };

  t.plan(2);
  t.equal(task(options), 'build("foo/bar.js", build.watch("**/*.js", "**/*.css").ignore("node_modules/**/*", "test/**/*"), doSomething({\n  "yo": "lo"\n}));');

  delete options.watch;
  options.type = 'task';
  options.task = 'yo';
  options.params['foo'] = 'bar';

  t.equal(task(options), 'task("yo", task.ignore("node_modules/**/*", "test/**/*"), doSomething({\n  "yo": "lo",\n  "foo": "bar"\n}));');
});
