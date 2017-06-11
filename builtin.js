const qs = require('querystring');

module.exports = function (injector) {
  var explicitStatusCode, body, path, query;
  injector.register('context', (res, req) => ({
    set body(val) {
      if (!explicitStatusCode) res.statusCode = 200;
      body = val;
    },
    set status(val) {
      explicitStatusCode = true;
      res.statusCode = val;
    },
    method: req.method,
    get query() {
      if (query) return query;
      const url = req.url;
      const markIndex = url.indexOf('?');
      query = qs.parse(url.slice(markIndex + 1));
      return query;
    },
    get path() {
      if (path) return path;
      const url = req.url;
      const markIndex = url.indexOf('?');
      path =  url.slice(0, markIndex);
      return path;
    },
    get() {
      return res.statusCode;
    },
    get body() {
      return body;
    },
  }));
};
