module.exports = bar;

function bar (c, d) {
  return function (b) {
    console.log('%d x %d is ', c, d, c * d);
    b.done();
  };
}
