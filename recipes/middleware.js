const path = require('path');
const { safe, r } = require('../util');

function getOrder(mpath) {
  let c1, c2;
  safe(() => c1 = r(path.join(mpath, '_order.js')));
  safe(() => c2 = r(path.join(mpath, '$order.js')));
  return c1 || c2 || [];
}

function setup(app, mpath, files) {
   // filter all the files
  let wears = files
    .map(name => path.relative(mpath, name).replace(/.js$/, ''))
    .filter(Boolean)
    .filter(name => name.indexOf('$order') === -1 && name.indexOf('_order') === -1);
  // sort in order and require them
  app.dmws = getOrder(mpath)
    .filter(x => wears.indexOf(x) > -1)
    .map(name => r(path.join(mpath, name)))
    .filter(Boolean);
}

module.exports = {
  setup,
  name: 'middleware'
};
