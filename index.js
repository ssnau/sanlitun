const http = require('http');
const injecting = require('injecting');
const promiseCall = require('xkit/util/promise-call');
const {
  last,
  noop,
} = require('./util');
const loadRecipe = require('./recipe');

class Application {
  constructor(config={}) {
    this.mws = [];
    this.dmws = [];
    this.services = {};
    this.dservices = {};
    this.handleRequest = this.handleRequest.bind(this);
    this.config = config;
    if (config.isDev) this.isDev = true;
  }

  listen(port) {
    loadRecipe(this, {
      controllerPath: this.config.controllerPath,
      servicePath: this.config.servicePath,
      middlewarePath: this.config.middlewarePath,
    });
    this.server = http.createServer(this.handleRequest);
    console.log('listening on ' + port);
    return promiseCall([this.server.listen, this.server], port);
  }

  register(name, fn) { this.services[name] = fn; }
  unregister(name) { this.services[name] = null; }

  // kind of mimcing koa's middleware syntax.
  // but feel free to operate directly with `this.mws`
  // as you may want to load / unload some middlewares
  // during dev mode
  use(fn) {
    this.mws.push(fn);
  }

  // The final place to handle response
  // assign `respond = false` to bypass this function
  respond(context, res, req) {
    if (context.respond === false) return;
    res.end(context.body);
  }

  handleRequest(req, res) {
    const context = {};
    const injector = injecting();
    context.injector = injector;
    
    // compose middlewares
    const mws = this.mws
      .concat(this.dmws)
      .concat(noop)
      .map(fn => injecting.proxy(fn));
    const len = mws.length;
    for (let i = 0; i < len; i++) {
      last(mws[i]).injectingResolvers = {
        next: () => () => injector.invoke(mws[i + 1], null)
      };
    }
    // q: why not Object.assign services first?
    // a: it can protect from user code overriding 
    //    built-in services and raise error
    injector.register('context', context);
    injector.register('req', req);
    injector.register('res', res);
    injector.register('app', this);
    // load services
    const loadService = (obj) => {
      Object.keys(obj).forEach(key => {
        if (obj[key]) injector.register(key, obj[key]);
      });
    };
    loadService(this.services);
    loadService(this.dservices);

    // run!
    const clean = () => injector.destory();
    injector.invoke(mws[0])
      .then(
        _ => this.respond(context, res, req),
        e => this.onerror(e, context, req, res))
      .then(clean, clean);
  }

  // please override this function
  // default to print error stack to browser
  onerror(e, context, req, res) {
    console.log(e);
    res.end('[please override the onerror method, as you dont want to show error stacks to end user] \n\n' + e.stack);
  }
}

module.exports = Application;
