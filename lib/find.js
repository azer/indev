var debug = require('./debug')('find'),
    fs    = require("fs"),
    iter  = require('iter');

module.exports = find;

function find(lookup, callback){

  var filename;

  iter(lookup.length)
    .done(notFound)
    .run(exists);

  function notFound(){
    console.log('\n    No Devfile found.\n');
  }

    function exists(next, i){
    fs.exists(lookup[i], function(exists){

      if(!exists) return next();

      debug('%s found', lookup[i]);

      callback(undefined, lookup[i]);

    });
  }


}
