var test = require("prova");
var task = require('../');

test('creating options', function (assert) {
  assert.plan(3);

  var o = task.watch('**/*.js', '**/*.css').ignore('node_modules/**/*', 'lib/*', 'examples/**/*', 'test/*');
  assert.deepEqual(o._watch, ['**/*.js', '**/*.css']);
  assert.deepEqual(o._ignore, ['node_modules/**/*', 'lib/*', 'examples/**/*', 'test/*']);

  o.expand(function () {
    assert.deepEqual(o.files, ['index.js']);
  });
});

test('a task with options', function (assert) {
  assert.plan(1);

  task('lorem ipsum', task.watch('**/*.js', '**/*.css').ignore('node_modules/**/*', 'lib/*', 'examples/**/*', 'test/*'), function (t) {
    assert.deepEqual(t.files, ['index.js']);
    t.done();
  }).run();
});

test('watching', function (assert) {
  assert.plan(2);

  var watcher;
  var t = task('watch out', task.watch('/tmp/bud-watch-out'), function () {
    assert.ok(true);
    watcher.close();
  });

  t.watch(function (error, _watcher) {
    watcher = _watcher;
    assert.error(error);
    setTimeout(function () {
      require('fs').writeFile('/tmp/bud-watch-out', 'yooo');
    }, 250);
  });
});
