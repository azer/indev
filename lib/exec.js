var debug = require('./debug')('exec:async');
var debugSync = require('./debug')('exec:sync');
var execSync = require('execSync').exec;
var cp = require("child_process");

module.exports = sync;
module.exports.async = async;

function async (command){
  var args = command.split(' '),
      name = args.splice(0, 1)[0];

  async.caller.cp || ( async.caller.cp = {} );

  if(async.caller.cp[command]){
    debug('Killing %s', command);
    async.caller.cp[command].kill();
  }

  debug(command);

  async.caller.cp[command] = cp.spawn(name, args, { stdio: 'inherit' });
  async.caller.cp[command].on('error', function(error){
    debug('Failed to run "%s": %s', command, error.message);
  });
}

function sync (command) {
  debugSync(command);

  var result = execSync(command);

  if (result.code == 0) return command.stdout;

  debugSync('Failed to run "%s"', command, result.stdout);
  throw new Error(result.stdout);
}
