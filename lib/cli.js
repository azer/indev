require("default-debug")('bud:run',
                         'bud:read',
                         'bud:exec',
                         'bud:exec:async',
                         'bud:exec:sync',
                         'bud:tasks',
                         'devfile:*');

var command = require("new-command")({
  'l': 'list',
  'f': 'file'
});

if(command.list) require('./list');

var bud = require('../');
bud(command);
