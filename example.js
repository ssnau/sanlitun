var Application = require('./');
var app = new Application();

app.use(function* (context, next) {
  context.body = 'hello';
  console.log('#1 enter');
  yield next();
  console.log('#1 leave');
});

app.use(function* (context, next) {
  context.body = 'hello 22';
  console.log('#2 enter');
  yield next();
  console.log('#2 leave');
});

app.use(function* (context, app, req, next) {
  console.log('rq', req.url);
  console.log('#3 enter');
  yield next();
  console.log('#3 leave');
  context.body = '333';
});
app.listen(9888);
