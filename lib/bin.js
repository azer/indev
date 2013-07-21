var debug  = require('./debug')('bin'),
    newCmd = require('./cmd');

module.exports = bin;

function bin(name){
  var cmd    = './node_modules/',
      params = Array.prototype.slice.call(arguments, 1);

  if(name.indexOf(' ') > -1){
    name = name.split(' ');
    params = name.slice(1).concat(params);
    name = name[0];
  }

  var slashAt = name.indexOf('/');
  if ( slashAt > -1 ) {
    cmd += name.slice(0, slashAt);
    name = name.slice(slashAt + 1);
    cmd += '/bin/' + name;
  } else {
    cmd += name;
    cmd += '/bin/' + name;
  }

  params.length && ( cmd += ' ' + params.join(' ') );

  debug('Defined %s as %s', name, cmd);

  return newCmd(cmd);
}
