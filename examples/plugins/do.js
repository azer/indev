var foo = require("./foo");
var bar = require("./bar");
var task = require("../../");

task('default', task.once('foo', 'bar'));
task('foo', foo(13, 17));
task('bar', bar(19, 27));
