const path = require('path');
const { safe } = require('../util');

function getOrder(mpath) {
  let c1, c2;
  safe(() => c1 = require(path.join(mpath, '_order.js')));
  safe(() => c2 = require(path.join(mpath, '$order.js')));
  return c1 || c2 || [];
}

function setup(app, mpath, files) {
   // filter all the files
  let wears = files
    .map(name => path.relative(mpath, name).replace(/.js$/, ''))
    .filter(Boolean)
    .filter(name => name.indexOf('$order') === -1 && name.indexOf('_order') === -1);
  console.log(wears);
  // sort in order and require them
  app.dmws = getOrder(mpath)
  .filter(log(1))
    .filter(x => wears.indexOf(x) > -1)
  .filter(log(2))
    .map(name => require(path.join(mpath, name)))
  .filter(log(3))
    .filter(Boolean);
}

function log(x) {
  return function(y) {
    console.log('-------');
    console.log(x);
    console.log(y);
    console.log('-------');
    return true;
  };
}

module.exports = {
  setup,
  name: 'middleware'
};
