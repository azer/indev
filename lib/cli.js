var opt = require('optimist');

require("default-debug")('indev:run',
                         'indev:read',
                         'indev:exec',
                         'indev:exec:async',
                         'indev:exec:sync',
                         'indev:tasks',
                         'devfile:*');

var argv = opt
      .options('list', { alias: 'l' })
      .options('file', { alias: 'f' })
      .options('version', { alias: 'v' })
      .options('help', { alias: 'h' })
      .argv;

var indev = require('../');

if(argv.help) require('show-help');
if(argv.version) require('show-version');
if(argv.list) require('./list');

indev(argv);
