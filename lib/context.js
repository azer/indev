var debug         = require('./debug')('context'),

    fs            = require("fs"),
    path          = require("path"),
    requireLike   = require('require-like'),
    shelljs       = require('shelljs'),

    exec          = require('./exec'),
    cmd           = require('./cmd'),
    bin           = require('./bin'),
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
    read          : read,
    write         : write,
    bin           : bin,
    cmd           : cmd,
    node          : cmd('node'),

    cat           : cmd('cat'),
    chmod         : cmd('chmod'),
    cp            : cmd('cp'),
    echo          : cmd('echo'),
    env           : cmd('env'),
    exit          : cmd('exit'),
    find          : cmd('find'),
    grep          : cmd('grep'),
    pgrep         : cmd('pgrep'),
    ls            : cmd('ls'),
    mkdir         : cmd('mkdir'),
    pushd         : cmd('pushd'),
    popd          : cmd('popd'),
    pwd           : cmd('pwd'),
    rm            : cmd('rm'),
    sed           : cmd('sed'),
    which         : cmd('which'),

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

function read(filename){
  return fs.readFileSync(filename, { encoding: 'utf8' });
}

function write(filename, content){
  return fs.writeFileSync(filename, content);
}
