const Routington = require('xkit/util/routington');
const { r } = require('../util');

function setup(app, mpath, files) {
  const router = new Routington();
  const pages = [];
  files.forEach(file => {
    [].concat(r(file) || []).forEach((p, idx) => {
      [].concat(p.url || p.urls || []).forEach(url => {
        pages.push({
          url,
          controller: p.controller,
          method: [].concat(p.method || p.methods || 'get').map(x => x.toUpperCase())
        });
      });
    });
  });

  // route pages
  pages.forEach(page => {
    if (!(page && page.controller)) return;

    const url = page.url.indexOf('/') !== 0 ? ('/' + page.url) : page.url;
    router.define(url).forEach(node => {
      node.controllers = [].concat(node.controllers).concat({
        method: page.method,
        methods: page.method,
        fn: page.controller
      }).filter(Boolean);
    });
  });
  app.pages = pages;

  function controller(req, context, injector) {
    const match = router.match(context.path);
    const controllers = match && match.node && match.node.controllers;
    if (!controllers) return console.error('no controller found for ' + url);

    let ctrl;
    for (let i = 0; i < controllers.length; i++) {
      let methods = controllers[i].methods;
      if (methods.indexOf(req.method) > -1) {
        ctrl = controllers[i];
        break;
      }
    }
    if (!ctrl) return console.error('cannot found controllers with method', url, req.method);
    context.params = match.param;
    if (ctrl) return injector.invoke(ctrl.fn, null, match.param);
  }
  app.cmws = [ controller ];
}

module.exports = {
  setup,
  name: 'controller'
};
