module.exports = function * (app, user, context, req, next) {
  context.body = user.getName();
  yield next();
};
