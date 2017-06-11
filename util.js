
function last(array) {
  return array[array.length - 1];
}

function safe(fn) {
  try { return fn(); } catch (e) { return undefined; }
}

function r(file) {
  const n = require(file);
  if (n && n['default']) return n['default'];
  return n;
}

function noop() {}

module.exports = {
  last,
  noop,
  safe,
  r
};
