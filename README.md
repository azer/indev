## bud

Minimalistic Task Manager

```js
build('dist.css', build.watch('**/*.css').ignore('dist.css'), function (b) {
  concat(b.files, 'dist.css', b.done)
})

task('clean', function (t) {
  rmrf('dist.*', t.done)
})
```

See it in action:

* [rm -rf]()
* [Concat Files]()
* [Browserify]()
* [Running Remote Commands]()
* [Starting A Static Server]()
* [Building JS and CSS and Sending To A Remote Machine]()
* [Default Tasks]()

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

### Dependent Tasks

You can define tasks that requires to complete other tasks *parelelly* first using the `.once` method:

```js
var task = require('bud')

task('foo', function (t) {
  t.end()
})

task('bar', function (t) {
  t.end()
})

task('qux', t.once('foo', 'bar'), function (t) {
  t.end()
})
```

### Local Bins

Bud automatically resolves and prefers local binaries for you. For example, following task will be running './node_modules/browserify/bin/cmd' instead of global `browserify`:

```js
var build = require('bud')

build('dist.js', function (b) {
  b.exec('browserify entry.js -o dist.js')
   .then(b.done);
})
```

### Parameters

You can define tasks that takes parameters from command-line. For example, let's say we wanna have a task that installs our app in remote machine with Docker:

```js
var task = require('bud')
var setupDocker = require('setup-docker')

task('install', function (t) {
  setupDocker({ name: 'your-app', ssh: t.params.remote, dockerfile: './Dockerfile', port: '80:8080' }, t.done);
})
```

And here is how you can call this task from command-line:

```js
$ node do install remote=azer@chessapp.com
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

## Examples

### rm -rf

Using a library:

```js
var task = require('bud')
var rmrf = require('rimraf-glob')

task('clean', function (t) {
  rmrf('dist.*', t.done)
})
```

Calling the `rm` command:

```js
task('clean', function (t) {
  t.exec('rm -rf dist.*').then(t.done)
})
```

### Concat Files

```js
var build = require('bud')
var concat = require('concat')

build('dist.css', build.watch('**/*.css').ignore('dist.css'), function (b) {
  concat(b.files, 'dist.css', b.done)
})
```

### Browserify

Using the library:

```js
var browserify = require('browserify')
var build = require('bud')

build('dist.js', build.watch('**/*.js').ignore('node_modules', 'dist.js'), function (b) {
  browserify('entry.js').bundle().pipe(build.write('dist.js'))
})
```

Calling the command:

```js
build('dist.js', build.watch('**/*.js').ignore('node_modules', 'dist.js'), function (b) {
  b.exec('browserify entry.js -o dist.js').then(b.done)
})
```

### Running Remote Commands

```js
var remotely = require('remotely')
var task = require('bud')

task('update remote', function (t) {
   var r = remotely('azer@yourapp.com', 'cd repo && git pull')
   r.on('close', t.done)
   r.stdout.pipe(t.stdout)
   r.stderr.pipe(t.stderr)
})
```

### Starting A Static Server

```js
task('publish', function (t) {
  t.exec('python -m SimpleHTTPServer').then(t.done)
})
```

### Running Tests and Restarting When Files Change

```js
var task = require('bud')

task('test', task.files('**/*.js'), function (t) {
  t.exec('node test').then(t.done)
})
```

Don't forget passing `-w` parameter:

```bash
$ node do test -w
```

### Building JS and CSS and Sending To A Remote Machine

```js
var task = require('bud')
var concat = require('concat')
var build = task

task('send', task.once('dist.js', 'dist.css'), function (t) {
  t.exec('scp dist.* {0}:/src/.', t.params.remote).then(t.done)
})

build('dist.js', build.watch('**/*.js').ignore('dist.js'), function (b) {
  concat(b.files, 'dist.js', b.done)
})

build('dist.css', build.watch('**/*.css').ignore('dist.css'), function (b) {
  concat(b.files, 'dist.css', b.done)
})
```

You can run this task once, or on every change on the files:

```bash
$ node do send remote=azer@yourapp.com -w
```

### Default Tasks

You can define a default task that will run when no task name is given, as a dependent task:

```js
task('default', task.once('dist.js', 'dist.css'))
```

## Missing Anything?

File an issue, pull requests are always welcome!

## In Progress

* fix cli args passed to spawn
* exec string formatting
* task.stdout, task.stderr
