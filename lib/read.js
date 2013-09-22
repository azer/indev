var debug  = require('debug')('bud:read'),
    fs     = require("fs"),
    comp   = require("comp"),
    coffee = require('coffee-script'),
    read   = comp(create, open, type, compileIfNeeded);

module.exports = read;

function compileIfNeeded(doc, callback){
  if(!doc.coffee) return callback(undefined, doc);

  doc.content = coffee.compile(doc.content);

  callback(undefined, doc);
}

function create (filename, callback){
  callback(undefined, {

    filename : filename,
    content  : undefined,
    js       : undefined,
    coffee   : undefined,
    type     : undefined

  });
}

function isCoffeeScript(doc){

  if( /require ("|')/.test(doc.content) )
    return true;

  if ( /\w+ ("|')/.test(doc.content) )
    return true;

  if ( /\-\>/.test(doc.content) )
    return true;
}


function open (doc, callback){
  fs.readFile(doc.filename, function(error, bf){

    if(error) return callback(error);

    doc.content = bf.toString();

    callback(undefined, doc);

  });
}

function type(doc, callback){

  if(doc.filename.slice(-3) == '.js')
    doc.type = 'js';

  if(!doc.type && doc.filename.slice(-7) == '.coffee')
    doc.type = 'coffee';

  if(!doc.type && isCoffeeScript(doc)){
    doc.type = 'coffee';
  } else if(!doc.type) {
    doc.type = 'js';
  }

  doc[doc.type] = true;

  debug('%s is written in %sScript. %s', doc.filename, doc.js ? 'Java' : 'Coffee', type.verbose());

  callback(undefined, doc);
}

type.verbose = function(){
  return type.verbose.msgs[ Math.floor( Math.random() * type.verbose.msgs.length ) ];
}

type.verbose.msgs = [
  'How nice!',
  'Wonderful choice!',
  'Like a boss!',
  'I love how hipster you are :P'
];
