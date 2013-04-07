all 'run', 'public/js', 'public/css'

task 'hello', ->
    write "/tmp/now", "Hello #{process.env.USER}!"
    debug pwd()

task 'run', './app.js', './lib', ->
    exec 'node app'

target 'public/js', 'javascripts', ->
    cd 'frontend'
    exec 'browserify javascripts/main.js -o public/bundle.js'

target 'public/css', 'styles', ->
    cd 'frontend'
    exec 'stylus styles -o public/css'
