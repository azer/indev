var debug = require('./debug')('exec'),
    cp    = require("child_process");

module.exports = exec;

function exec(command){
  var args = command.split(' '),
      name = args.splice(0, 1)[0];

  exec.caller.cp || ( exec.caller.cp = {} );

  if(exec.caller.cp[command]){
    debug('Killing %s', command);
    exec.caller.cp[command].kill();
  }

  debug(command);

  exec.caller.cp[command] = cp.spawn(name, args, { stdio: 'inherit' });
  exec.caller.cp[command].on('error', function(error){
    debug('Failed to run "%s": %s', command, error.message);
  });
}
