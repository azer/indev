Minimalistic replacement for Makefiles.

```coffee
task 'run', 'server.js', ->
    exec "node server"
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

Following task will be watching run.js and lib/* and restarting the task on any change:

```coffee
task 'start', 'lib', 'run.js', ->
    exec 'node app'
```

The first parameter of the given callback will have the list of changed files;

```coffee
task 'watch', 'lib/**/*.js', 'run.js', (files) ->
    files.forEach (file) ->
        debug "#{file} updated."
```

## Defining Targets

`target` is an alias that would make your tasks look more meaningful.

```coffee
target 'dist.js', 'index.js', 'lib', ->
    exec 'onejs index -o dist.js'
```

## Defining Multiple Tasks

```coffee
all 'run', 'public/js', 'public/css'

task 'run', './app.js', './lib', ->
    exec 'node app'

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

### Debugging

```bash
$ DEBUG=indev:* indev
```
