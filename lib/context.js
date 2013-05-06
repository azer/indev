var debug         = require('./debug')('context'),

    fs            = require("fs"),
    path          = require("path"),
    requireLike   = require('require-like'),
    shelljs       = require('shelljs'),

    exec          = require('./exec'),
    tasks         = require('./tasks'),
    mocks         = {};

module.exports = newContext;

function newContext(filename){
  var exports = {},
      module  = { exports: exports },
      context;

  context = {
    // API
    all           : tasks.all,
    task          : tasks.add,
    target        : tasks.add,
    alias         : tasks.alias,

    // Extensions
    debug         : require('debug')('devfile:' + filename),
    exec          : exec,
    write         : write,

    cat           : shelljs.cat,
    chmod         : shelljs.chmod,
    cp            : shelljs.cp,
    cd            : shelljs.cd,
    dirs          : shelljs.dirs,
    echo          : shelljs.echo,
    env           : shelljs.env,
    exit          : shelljs.exit,
    find          : shelljs.find,
    grep          : shelljs.grep,
    ls            : shelljs.ls,
    mkdir         : shelljs.mkdir,
    pushd         : shelljs.pushd,
    popd          : shelljs.popd,
    pwd           : shelljs.pwd,
    rm            : shelljs.rm,
    sed           : shelljs.sed,
    which         : shelljs.which,

    // Standard Environment
    __filename    : filename,
    __dirname     : path.dirname(filename),

    Buffer        : Buffer,

    process       : process,
    console       : console,

    setTimeout    : setTimeout,
    clearTimeout  : clearTimeout,
    setInterval   : setInterval,
    clearInterval : clearInterval,

    exports       : exports,
    require       : mockRequire(filename),
    module        : module
  };

  return context;
}

function mockRequire(relative){
  var relativeRequire = requireLike(relative);

  return function(module){
    if(mocks[module]){
      return mocks[module];
    }

    return relativeRequire(module);
  };
}

function write(filename, content){
  fs.writeFileSync(filename, content);
}
