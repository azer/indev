var test = require("prova");
var task = require('../');
var loop = require("parallel-loop");

test('running multiple tasks paralelly', function (assert) {
  assert.plan(21);

  loop(10, each, function () {
    assert.ok(true);
  });

  function each (done, i) {
    var isDone = false;

    var t = task('task ' + i, function (task) {
      assert.notOk(isDone);

      setTimeout(function () {
        isDone = true;
        assert.ok(true);
        task.done();
      }, Math.floor(Math.random()*100));
    });

    t.run(done);
  }
});

test('a test depending on two other tasks', function (assert) {
  assert.plan(3);

  var t1done = false;
  var t2done = false;
  var t3done = false;

  var t1 = task('foo 1', task.files('examples/build/*.js'), function (task) {
    setTimeout(function () {
      task.done();
      t1done = true;
    }, 50);
  });

  var t2 = task('bar 2', task.files('examples/build/*.css'), function (task) {
    setTimeout(function () {
      task.done();
      t2done = true;
    }, 100);
  });

  var t3 = task('qux', task.once('foo 1', 'bar-2'), function (task) {
    /*assert.deepEqual(task.files, [
      'examples/build/a.js', 'examples/build/b.js', 'examples/build/c.js', 'examples/build/do.js',
      'examples/build/a.css', 'examples/build/b.css', 'examples/build/c.css'
    ]);*/

    setTimeout(function () {
      assert.ok(t1done);
      assert.ok(t2done);
      t3done = true;
      task.done();
    }, 10);
  });

  t3.run(function () {
    assert.ok(t3done);
  });
});

test('a task may subscribe to other tasks', function (assert) {
  assert.plan(2);

  var t1done = true;
  var t2done = true;

  var t1 = task('task a', task.files('examples/build/*.js'), function (task) {
    setTimeout(function () {
      task.done();
      t1done = true;
    }, 50);
  });

  var t2 = task('task b', task.files('examples/build/*.css'), function (task) {
    setTimeout(function () {
      task.done();
      t2done = true;
    }, 100);
  });

  var t3 = task('task c', task.when('task a', 'task b'), function (task) {
    setTimeout(function () {
      assert.ok(t1done);
      assert.ok(t2done);
      task.done();
    }, 10);
  });

  t1.run();
  t2.run();
});
