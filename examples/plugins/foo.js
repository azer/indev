foo.params = [
  'X (a random number)',
  'Y (another random number)'
];

module.exports = foo;

function foo (x, y) {
  return function (b) {
    console.log('%d + %d is ', x, y, x + y);
    b.done();
  };
}
