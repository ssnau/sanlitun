const http = require('http');
const injecting = require('injecting');
const promiseCall = require('xkit/util/promise-call');

const {
  last,
  noop,
} = require('./util');

class Application {

  constructor() {
    this.mws = [];
    this.services = [];
    this.handleRequest = this.handleRequest.bind(this);
  }

  listen(port) {
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
    const context = Object.create({});
    const injector = injecting();
    context.injector = injector;
    const mws = this.mws.concat(noop).map(fn => injecting.proxy(fn));
    const len = mws.length;
    for (let i = 0; i < len; i++) {
      last(mws[i]).injectingResolvers = {
        next: () => () => injector.invoke(mws[i + 1])
      };
    }
    // q: why not Object.assign services first?
    // a: it can protect from user code overriding 
    //    built-in services and raise error
    injector.register('context', context);
    injector.register('req', req);
    injector.register('res', res);
    injector.register('app', this);
    Object.keys(this.services).forEach(key => {
      if (this.services[key]) injector.register(key, this.services[key]);
    });
    injector.invoke(mws[0])
      .then(
        _ => this.respond(context, res, req),
        e => this.onerror(e, context, req, res))
      .then(() => injector.destory());
  }

  // user can override this function to
  // better handling errors
  onerror(e, context, req, res) {
    console.log(e);
    res.end('error');
  }
}

module.exports = Application;
