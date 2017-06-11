module.exports = [
  {
    url: '/test/:req/:username',
    * controller(context, $) {
      const { req, username } = context.params;
      context.body = 'test:' + req + ':' + username;
    }
  },
  {
    url: '/favicon.ico',
    * controller(context) {
      context.body = '';
    }
  }
];
