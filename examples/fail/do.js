var task = require('../../');

task('default', task.once('fail', 'not fail'));

task('fail', function (t) {
  t.error(new Error('yo'))
})

task('not fail', function (t) {
  t.done();
})
