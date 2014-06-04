var task = require("../../");

task('echo', function (t) {
  t.exec('echo "' + (t.params.msg || 'usage: node do msg=something"')).then(t.done);
});

task('default', task.once('echo'));
