const path = require('path');

function setup(app, spath, files) {
  app.dservices = {};
  files.forEach(file => {
    const name = path.relative(spath, file)
      .replace(/\//g, '$')
      .replace(/\.js$/, '');
    app.dservices[name] =  require(file);
  });
}

module.exports = {
  setup,
  filter: /js$/,
  name: 'service',
};