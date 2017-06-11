
function last(array) {
  return array[array.length - 1];
}

function safe(fn) {
  try { return fn(); } catch (e) { return undefined; }
}

function noop() {}

module.exports = {
  last,
  noop,
  safe
};
