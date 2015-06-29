var Struct = require("new-struct");
var debug = require("local-debug")('options');
var expand = require("./expand");

var Options = Struct({
  New: New,
  expand: expand.options,
  watch: watch,
  ignore: ignore,
  when: when
});

module.exports = Options;

function New (obj) {
  return Options({
    _watch: obj && obj.watch || undefined,
    _ignore: obj && obj.ignore || undefined,
    _once: obj && obj.once || undefined,
    _when: obj && obj.when || undefined
  });
}

function watch (options) {
  options._watch = Array.prototype.slice.call(arguments, 1);
  return options;
}

function ignore (options) {
  options._ignore = Array.prototype.slice.call(arguments, 1);
  return options;
}

function when (options) {
  options._when = Array.prototype.slice.call(arguments, 1);
  return options;
}
