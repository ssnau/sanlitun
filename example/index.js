let path = require('path');
let Application = require('../');
let app = new Application({
  isDev: true,
  servicePath: path.join(__dirname, 'service'),
  middlewarePath: path.join(__dirname, 'middleware'),
  controllerPath: path.join(__dirname, 'controller')
});

app.use(function * (context, next) {
  console.time('x');
  context.body = 'hello';
  console.log('#1 enter');
  yield next();
  console.log('#1 leave');
  console.timeEnd('x');
});

app.use(function * (context, next) {
  context.body = 'hello 22';
  console.log('#2 enter');
  yield next();
  console.log('#2 leave');
});

app.use(function * (context, app, req, next) {
  console.log('rq', req.url);
  console.log('#3 enter');
  context.body = '333';
  console.log('after assign 333');
  yield next();
  console.log('#3 leave');
});
app.listen(9888);
