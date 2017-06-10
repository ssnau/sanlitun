var Application = require('./');
var app = new Application();

app.use(function (context, next) {
  context.body = 'hello';
  return next();
});

app.use(function (context, next) {
  context.body = 'hello 22';
  return next();
});

app.use(function (context, app, req, next) {
  console.log('rq', req.url);
  debugger;
  context.body = '333';
});
app.listen(9888);
