all('run', 'public/js', 'public/css');

task('hello', function() {
  write("/tmp/now", "Hello " + process.env.USER + "!");
  debug(pwd());
});

task('run', './app.js', './lib', function() {
  exec('node app');
});

target('public/js', 'javascripts', function() {
  cd('frontend');
  exec('browserify javascripts/main.js -o public/bundle.js');
});

target('public/css', 'styles', function() {
  cd('frontend');
  exec('stylus styles -o public/css');
});
