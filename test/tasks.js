var test = require("prova");
var task = require('../');

test('a simple task', function (assert) {
  assert.plan(6);

  var done = false;

  var t = task('foo bar', function (t) {
    setTimeout(function () {
      done = true;
      t.done();
    }, 100);
  });

  assert.equal(t.key, 'foo-bar');
  assert.equal(t.name, 'foo bar');

  t.run(function () {
    assert.notOk(t.files);
    assert.ok(done);
  });

  t.run(function () {
    assert.ok(true);
  });

  t.run(function () {
    assert.ok(true);
  });
});

test('calling done twice', function (assert) {
  var t = task('yolo', function (t) {
    t.done();

    setTimeout(function () {
      t.done();
    }, 250);
  });

  t.run();
});

test('accessing task map from task instance', function (assert) {
  assert.plan(1);
  task('yoo', function (t) {
    assert.equal(t, t.tasks.get('yoo'));
  }).run();
});
