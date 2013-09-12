Minimalistic task manager.

```coffee
browserify = bin 'browserify/cmd'
uglify = bin 'uglify-js/uglifyjs'

target 'dist.js', 'entry.js', ->
    browserify 'entry.js -o dist.js'

target 'dist.min.js', 'dist.js', ->
    uglify 'dist.js -o dist.min.js'

task 'clean', ->
    rm '-rf logs/*.txt'
```

![](https://dl.dropbox.com/s/imo9jsn9bj0p70a/indev.png)

## Install

```bash
$ npm install -g indev
```

## Usage

Create a new [Devfile](https://github.com/azer/indev/blob/master/lib/look-up.js),
and code your tasks in *JavaScript* or *CoffeeScript*.

## Defining A Task

```coffee
task 'run', ->
    exec 'node app'
```

Or

```js
task('run', function(){
    exec('node app');
});
```

To run:

```bash
$ indev run
```

## Shell Commands

[ShellJS](https://github.com/arturadib/shelljs) is [available in Devfiles](https://github.com/azer/indev/blob/master/lib/context.js#L30) globally.

```coffee
task 'hello/world', ->
    mkdir '-p', 'hello/world'
    write 'hello/world/README.txt', 'Hello World!'

    cd 'lib'
    cp 'stuff/*', '../hello/world'

    ls './', (file) ->
        debug "Copied lib/#{file} to hello/world/."
```

## Watching Files

The parameters after a task name considered as files to watch.
Following task will watch `run.js` and `lib/` and restart the task on any change:

```coffee
task 'start', 'lib', 'run.js', ->
    exec.async 'node app'
```

The first parameter of the given callback will have the list of changed files;

```coffee
task 'watch', 'lib/**/*.js', 'run.js', (files, changed) ->
    debug "All matching files: ", files

    files.forEach (file) ->
        debug "#{file} has been changed."
```

## Defining Targets

`target` is an alias that would make your tasks look more meaningful.

```coffee
target 'dist.js', 'index.js', 'lib', ->
    exec 'onejs index -o dist.js'
```

## Calling Commands

```coffee
uglify = cmd "uglifyjs"

task "minify", ->
  uglify "src.js -o min.js"
  debug "done"
```

### Calling Asynchronously

All commands are run synchronously by default. Use `async` method to change it:

```coffee
staticServer = cmd.async "python -m SimpleHTTPServer"
apiServer = cmd.async "node server"

all "api-server", "serve-static"

task "api-server", ->
    apiServer()
    debug "api server up"

task "serve-static", ->
    staticServer()
    debug "static server up"
```

Calling `indev` on this file will start these two servers at the time.

### Shortcut to node_modules/bin

```coffee
stylus = bin "stylus" # node_modules/stylus/bin/stylus
uglify = bin "uglify-js/uglifyjs" # node_modules/uglify-js/bin/uglifyjs
serve = bin.async "serve" # node_modules/serve/bin/serve

target "dist.js", ->
    uglify "index.js -o dist.js"

target "style.css", ->
    stylus "style.styl"

target "serve", ->
    serve()
```

## Defining Multiple Tasks

```coffee
all 'run', 'public/js', 'public/css'

task 'run', './app.js', './lib', ->
    exec.async 'node app'

target 'public/js', 'javascripts', ->
    cd 'frontend'
    exec 'browserify javascripts/main.js -o public/bundle.js'

target 'public/css', 'styles', ->
    cd 'frontend'
    exec 'stylus styles -o public/css'
```

To run all tasks:

```bash
$ indev
```

To run specific tasks;

```bash
$ indev public/js public/css
```

Define aliases to type less:

```coffee
alias 'assets', 'public/js', 'public/css'
```

```bash
$ indev assets
```

### Debugging

```bash
$ DEBUG=indev:* indev
```
