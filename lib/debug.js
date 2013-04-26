var debug  = require("debug"),
    prefix = require('../package').name;

module.exports = function(name){
  return debug(prefix + ':' + name);
};
