const http = require('http');
const injecting = require('injecting');
const promiseCall = require('xkit/util/promise-call');
const {
  last,
  noop
} = require('./util');
const loadRecipe = require('./recipe');
const builtin = require('./builtin');

class Application {
  constructor(config = {}) {
    this.mws = [];  // default mws
    this.dmws = []; // dynamic mws
    // feel free to override cmws if you
    // want to controll router your self
    this.cmws = [];
    this.services = {};
    this.dservices = {};
    this.config = config;
    this.server = null;
    this.handleRequest = this.handleRequest.bind(this);
    if (config.isDev) this.isDev = true;
  }

  // override me if you want to do some setup work
  // before server starts
  beforeListen() {}

  listen(port) {
    // lazy load recipes, you have enough time to
    // customize sanlitun before its server starts
    loadRecipe(this, {
      controllerPath: this.config.controllerPath,
      servicePath: this.config.servicePath,
      middlewarePath: this.config.middlewarePath
    });
    this.beforeListen();
    const server = http.createServer(this.handleRequest);
    this.server = server;
    return promiseCall([server.listen, server], port || 0)
      .then(() => console.log('listening on ' + server.address().port));
  }

  register(name, fn) { this.services[name] = fn; }
  unregister(name) { this.services[name] = null; }

  // kind of mimcing koa's middleware syntax.
  // but feel free to operate directly with `this.mws`
  // as you may want to load / unload some middlewares
  // during dev mode
  use(fn) { this.mws.push(fn); }

  // The final place to handle response
  // assign `respond = false` to bypass this function
  respond(context, res, req) {
    if (context.respond === false) return;
    if (res.headersSent) return;
    const body = context.body || 'not found';
    // responses
    if (Buffer.isBuffer(body)) return res.end(body);
    if ('string' == typeof body) return res.end(body);
    if (body instanceof Stream) return body.pipe(res);
    res.end(body);
  }

  handleRequest(req, res) {
    const injector = injecting();

    // compose middlewares
    const mws = this.mws
      .concat(this.dmws)
      .concat(this.cmws)
      .concat(noop)
      .filter(Boolean)
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
    injector.register('injector', injector);
    injector.register('$', () => name => injector.get(name)); // shortcut
    injector.register('req', req);
    injector.register('res', res);
    injector.register('app', this);
    builtin(injector);
    // load services
    const loadService = obj => {
      Object.keys(obj).forEach(key => {
        if (obj[key]) injector.register(key, obj[key]);
      });
    };
    loadService(this.services);
    loadService(this.dservices);

    // run!
    const clean = () => injector.destory();
    res.statusCode = 404;
    return injector.invoke((context) => {
      return injector.invoke(mws[0])
             .then(
              _ => this.respond(context, res, req),
              e => this.onerror(e, context, req, res))
            .then(clean, clean);
    })

  }

  // please override this function
  // default to print error stack to browser
  onerror(e, context, req, res) {
    console.log(e);
    res.end('[please override the onerror method, as you dont want to show error stacks to end user] \n\n' + e.stack);
  }
}

module.exports = Application;
