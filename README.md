## bud

Minimalistic Task Manager

```js
var concat = require('concat')
var rmrf = require('rm-rf')

var task = require('bud')
var build = task

build('dist.css', build.watch('**/*.css').ignore('dist.css'), function (b) {
  concat(b.files, 'dist.css', b.done)
})

task('clean', function (t) {
  rmrf('dist.*', t.done)
})
```

Examples:

* [Concat Files](#concat-files)
* [Browserify](#browserify)
* [rm -rf](#rm--rf)
* [Default Tasks](#default-tasks)
* [Running Remote Commands](#running-remote-commands)
* [Starting A Static Server](#starting-a-static-server)
* [Building JS and CSS and Sending To A Remote Machine](#building-js-and-css-and-sending-to-a-remote-machine)

## Install

```bash
$ npm install bud
```

## Getting Started

Create a regular JavaScript (or Coffee, whatever) and require bud as "task" or "build":

```js
var task = require('bud')
```

And create your first task;

```js
var task = require('bud')

task('say hello', function (t) {
  t.exec('echo "hello!"').then(t.done)
})
```

The task above just says hello by spawning child process. To call this task in your command-line is pretty simple, all you do is calling the script you've created. In this example, I saved my tasks as `do.js` so I can simply call `node do`:

```bash
$ node do say-hello
say-hello  Running...
say-hello  (3951:echo "hello!")  "hello!"
```

Tasks can take parameters from command-line:

```js
task('say hello', function (t) {
  t.exec('echo "hello {name}!"', t.params).then(t.done)
})
```

Passing parameters is similar to Makefiles:

```bash
$ node do say-hello name=azer
say-hello  Running...
say-hello  (3951:echo "hello!")  "hello azer!"
```

### Watching For Changes

To watch files, choose the files to watch per task;

```js
var task = require('bud')

task('say hello', task.files('*.js'), function (t) {
  t.files
  // => ['foo.js', 'bar.js' ...]

  t.exec('echo "hello!"').then(t.done)
})
```

Pass `-w` or `--watch` parameter to enable file watching:

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

You can define tasks that requires to complete other tasks paralelly first using the `.once` method:

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

## Plugins

Bud now supports plugins to save your time. Each plugin is separate NPM package that exports a function. Here is an example;

```js
var browserify = require('browserify')
var fs = require('fs')

plugin.params = [ // This will be used for command-line UI to auto-generate bud files
  'Entry', // Or; { name: 'Entry', description: 'Entry file of the NPM project that will be browserified.' },
  'Destination'  // Or; { name: 'Destination file', description: 'Path to the file to be written for output.' }
];

module.exports = plugin;

function plugin (entry, dest) {
  return function (b) {
    browserify(entry).bundle().on('error', b.error).on('end', b.done).pipe(fs.createWriteStream(dest))
  }
}
```

And this is how would you use it in your bud file:

```js
var build = require('bud')
var browserify = require('bud-browserify')

build('dist.js', build.watch('*.js').ignore('dist.js'), browserify('entry.js', 'dist.js'))
```

## Auto-generate

Bud command-line tool has an option to auto-generate bud files. Here is an example usage;

![](https://cldup.com/V6l-edrqt9.png)

Above example will output following code into `do.js`:

```js
var task = require("bud");
var build = task;
var browserify = require("bud-browserify");

task("default", task.once("dist/build.js"));

task("dist/build.js", build.watch("**/*.js").ignore("dist"), browserify("index.js", "dist/build.js"));
```

You can choose as much as plugins you'd like to have. Here is a longer example command;

```bash
$ bud -g do.js dist/build.js=bud-browserify dist/build.css=bud-concat dist/index.html=bud-generate-index
```

## Examples

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

## Command-line Reference

```
    USAGE

        bud [filename] [options]

    OPTIONS

        -l    --list        List all available tasks.
        -w    --watch       Watch for changes and restart the task.

        -e    --verbose     Be talkative.
        -s    --silent      Mute.

        -v    --version     Show version and exit.
        -h    --help        Show help and exit.
```



## Missing Anything?

File an issue, pull requests are always welcome!

