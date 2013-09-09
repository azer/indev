var exec = require("./exec");

module.exports = cmd;
module.exports.async = async;

function async () {
  return cmd.apply(undefined, arguments).async;
}

function cmd(name){
  sync.async = async;
  async.isBinCommand = sync.isBinCommand = true;

  return sync;

  function async(){
    if(arguments.length) {
      return exec.async(name + ' ' + Array.prototype.slice.call(arguments).join(' '));
    }

    return exec.async(name);
  };

  function sync(){
    if(arguments.length) {
      return exec(name + ' ' + Array.prototype.slice.call(arguments).join(' '));
    }

    return exec(name);
  };
}
