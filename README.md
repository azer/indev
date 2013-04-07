Simple & powerful replacement for Make & Grunt. Aims to let you write and read less, do more.

```bash
$ npm install -g indev
```

## Usage

Create a new "Devfile" *(or Devfile.js, Devfile.coffee)* in your project directory.
You can code Devfiles in **either JavaScript or CoffeeScript**.

ShellJS and a file watcher injected by default. No need to require anything to start.

```coffee
all 'run', 'public/js', 'public/css'

task 'hello' ->
    write "/tmp/now" "Hello #{process.env.USER}!"
    debug pwd() # printss the current directory into console

task 'run', './app.js', './lib' -> # "run" is the task name. Remaining parameters are filenames to watch.
    exec 'node app'

# below line defines a new task named "public/js", watches changes on "./javascripts"
target 'public/js', 'javascripts' -> # `target` is just an alias for `task`.
    cd 'frontend'
    exec 'browserify javascripts/main.js -o public/bundle.js'

target 'public/css', 'styles', -> # same as `public/js`, it watches 'styles' directory and outputs to public/css.
    cd 'frontend'
    exec 'stylus styles -o public/css'
```

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
