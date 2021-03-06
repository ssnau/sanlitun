const readdir = require('xkit/fs/readdir');
const watch = require('xkit/fs/watch');
const path = require('path');

function process(app, rpath, loader) {
  if (!rpath) return;

  const filter = loader.filter || /\.js$/;
  // ignore files and folders start with '_'
  // ignore files with `spec.js`
  const gf = () =>
    readdir(rpath, { pattern: f => path.relative(rpath, f).indexOf('/_') === -1 })
    .filter(f => !/spec\.js/.test(f))
    .filter(f => /js$/.test(f));

  loader.setup(app, rpath, gf());
  if (!app.isDev) return;
  watch({
    path: rpath,
    pattern: filter,
    name: loader.name,
    callback: f => {
      const start = Date.now();
      delete require.cache[path.join(rpath, f)];
      try {
        loader.setup(app, rpath, gf());
      } catch (e) {
        console.error(`reload ${loader.name} error:`, e.stack);
      }
      console.log(`[${Date.now() - start}ms] reload ${loader.name}`);
    }
  });
}

module.exports = function(app, paths) {
  process(app, paths.middlewarePath, require('./recipes/middleware'));
  process(app, paths.servicePath, require('./recipes/service'));
  process(app, paths.controllerPath, require('./recipes/controller'));
};
