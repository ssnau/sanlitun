module.exports = function * (user, context, next) {
  console.log('name enter');
  this.body = user.getName();
  yield next();
  console.log('name leave');
};
