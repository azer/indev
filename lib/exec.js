var debug = require('./debug')('exec'),
    cp    = require("child_process"),
    Q     = require('q');

module.exports = exec;

function exec(command){
  var args = command.split(' '),
      name = args.splice(0, 1)[0],
      deferred = Q.defer();

  exec.caller.cp || ( exec.caller.cp = {} );

  if(exec.caller.cp[command]){
    debug('Killing %s', command);
    exec.caller.cp[command].kill();
  }

  debug(command);

  var child = cp.spawn(name, args, { stdio: 'inherit' });
  child.on('error', function(error){
    debug('Failed to run "%s": %s', command, error.message);
    deferred.reject();
    process.exit(1);
  });
  child.on('exit', function(code, signal) {
    if (code) {
      deferred.reject(code);
    } else {
      deferred.resolve(code);
    }
  });
  exec.caller.cp[command] = child;
  return deferred.promise;
}
