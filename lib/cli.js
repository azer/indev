var opt = require('optimist');

require("default-debug")('bud:run',
                         'bud:read',
                         'bud:exec',
                         'bud:exec:async',
                         'bud:exec:sync',
                         'bud:tasks',
                         'devfile:*');

var argv = opt
      .options('list', { alias: 'l' })
      .options('file', { alias: 'f' })
      .options('version', { alias: 'v' })
      .options('help', { alias: 'h' })
      .argv;

var bud = require('../');

if(argv.help) require('show-help');
if(argv.version) require('show-version');
if(argv.list) require('./list');

bud(argv);
