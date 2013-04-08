Simple & powerful replacement for Make & GruntJS. Aims to let you write and read less, do more.

```bash
$ npm install -g indev
```

![](https://dl.dropbox.com/s/imo9jsn9bj0p70a/indev.png?token_hash=AAHJaVO7QTSQxWWqLaNsBwaJfwU2pf8WlF7COJ9v5FNTaw)

## Usage

Create a new "Devfile" *(or Devfile.js, Devfile.coffee)* in your project directory.
You can code Devfiles in **either JavaScript or CoffeeScript**.

ShellJS injected by default. No need to require anything to start.

### Defining Tasks

```coffee
target 'destination', 'watching-files/lib', 'watching-files/src', ->
    cp 'foo', 'bar'
    mkdir 'foobar'
    exec 'node app'
```

The above code is a simple task definition. `target` is actually an alias for `task` function, and it lets you
create new tasks by specifying a name, files to observe and a function that will be called once at start, and whenever
`watching-files/lib` or `watching-files/src` has a change.

The simplest usage could be;

```coffee
task 'run', 'server.js', ->
    exec "node server"
```

It'll be running your server and restarting it when you change server.js:

```bash
$ indev run
```

### Example Devfile

Let's look at a real world example;

```coffee
all 'run', 'public/js', 'public/css'

task 'hello', ->
    write "/tmp/now", "Hello #{process.env.USER}!"
    debug pwd() # printss the current directory into console

task 'run', './app.js', './lib', -> # "run" is the task name. Remaining parameters are filenames to watch.
    exec 'node app'

# below line defines a new task named "public/js", watches changes on "./javascripts"
target 'public/js', 'javascripts', -> # `target` is just an alias for `task`.
    cd 'frontend'
    exec 'browserify javascripts/main.js -o public/bundle.js'

target 'public/css', 'styles', -> # same as `public/js`, it watches 'styles' directory and outputs to public/css.
    cd 'frontend'
    exec 'stylus styles -o public/css'
```

### Running `indev`

Once you have a `Devfile` in your project, run `indev` command;

```bash
$ indev
```

To run only specific commands:

```bash
$ indev public/js run
```

This will be calling only `public/js` and `run` tasks.

See `examples` and `indev --help` for more information.

### Debugging

Enabling all logs will help you understand what's going on behind of the scene.

```bash
$ DEBUG=indev:* indev
```
