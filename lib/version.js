var puts = require('util').puts;

module.exports = version;

function version(){
  var manifest = require('../package.json');
  puts(manifest.name + ' v' + manifest.version);
  process.exit(0);
}
