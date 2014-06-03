## bud

Minimalistic Task Manager

```js
var task = require('bud')
var rmrf = require('rimraf')
var concat = require('concat')
var browserify = require('browserify')

var build = task

build('dist.js', build.watch('**/*.js').ignore('node_modules', 'dist.js'), function (b) {
  browserify('entry.js').bundle().pipe(build.write('dist.js'))
})

build('dist.css', build.watch('**/*.css').ignore('dist.css'), function (b) {
  concat(b.files, 'dist.css', b.done)
})

task('publish', function (t) {
  t.exec('python -m SimpleHTTPServer').then(t.end)
})

task('clean', function (t) {
  rmrf('dist.js', t.done)
})

task('default', task.once('dist.js', 'dist.css'))
```

## Install

```bash
$ npm install bud
```

## What's New?

The old version is completely gone, I've rewritten Bud during my last flight.
Read the guide below for the new documentation, or jump to the [old documentation](https://medium.com/@azerbike/introducing-bud-6a4c74b4bd90).

## Getting Started

Create a regular JavaScript (or Coffee, whatever) and require bud as "task" or "build":

```js
var task = require('bud')
```

And create your first task;

```js
var task = require('bud')

task('say hello', function (t) {
  t.exec('echo "hello!"')
    .then('date "+%d %h %H:%M"')
    .then(t.done)
})
```

The task above just says hello and outputs today's date and time by spawning child processes serially. To call this task in your command-line is pretty simple, all you do is calling the script you've created;

```bash
$ node do say-hello
say-hello  Running...
say-hello  (3951:echo "hello!")  "hello!"
say-hello  (3952:date '+...%H:%M') 03 Jun 02:11
```

You can run multiple tasks at once, define a `default` task to run when no task name is given.

### Watching For Changes

To watch files, pass extra options when you create a new task;

```js
var task = require('bud')

task('say hello', task.watch('*.js'), function (t) {
  t.exec('echo "hello!"')
    .then('date "+%d %h %H:%M"')
    .then(t.done)
})
```

And pass `-w` or `--watch` parameter to enable file watching:

```js
$ node do say-hello -w
```

This will restart the task by killing any actively running processes.

`.watch` method returns a chain with three more methods;

* ignore
* once
* files

**ignore:** takes any filenames or glob patterns to specify the files to ignore.
**once:** specifies the other tasks to be completed before running the defining task.
**files:** alias for the `watch` method.

### Local Bins

Bud automatically resolves and prefers local binaries for you. For example, following task will be running './node_modules/browserify/bin/cmd' instead of global `browserify`:

```js
build('dist.js', function (b) {
  b.exec('browserify entry.js -o dist.js')
   .then(b.done);
})
```

### Command-line Usage

To list available tasks in a file, pass -l or --list;

```bash
$ node [filename] -l
```

To see bud help:

```bash
$ node [filename] -h # or --help
```
