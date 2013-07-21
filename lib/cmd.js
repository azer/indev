var exec = require("./exec");

module.exports = cmd;

function cmd(name){
  run.isBinCommand = true;

  return run;

  function run(){
    if(arguments.length) {
      return exec(name + ' ' + Array.prototype.slice.call(arguments).join(' '));
    }

    return exec(name);
  };
}
