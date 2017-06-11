module.exports = [
  {
    url: '/test',
    * controller(context, req, $, res) {
      console.log('####', context.path);
      console.log(context.query);
      context.body = 'test:' + req.url;
    }
  },
  {
    url: '/favicon.ico',
    * controller(context) {
      context.body = '';
    }
  }
];
