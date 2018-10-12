const { Server } = require('hapi');

const common = require('../../http2-common/index');

const app = new Server({
  listener: common.server,
  port: 7002,
});

app.route([{
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    const { req } = request.raw;

    if (req.httpVersion === '2.0') {
      const { stream } = req;
  
      if (!stream.pushAllowed) return common.index;
  
      const cachedUnicorns = common.unicorns.slice(0, 3);

      console.log('cachedUnicorns', cachedUnicorns);
  
      cachedUnicorns.forEach((unicorn) => {
        stream.pushStream({ ':path': unicorn.path }, (err, pushStream) => {
          if (err) throw err;
  
          pushStream.respond({ ':status': 200 });
          pushStream.end(JSON.stringify(unicorn));
        });
      });
    }

    return common.index;
  },
 }, {
   method: 'GET',
   path: '/unicorns/{id}',
   handler: async (request, h) => {
    const id = request.params.id;
    const unicorn = common.unicorns[id - 1] || {};

    await common.sleep(1000);

    const response = h.response(unicorn);

    response.header('x-magic-header', 'magic');
    response.statusCode = 201;

    return response;
   },
 }, {
   method: 'POST',
   path: '/unicorns',
   handler: (request, h) => {
    const response = h.response(request.payload);

    response.statusCode = 201;

    return response;
   },
 }]);

app.start((err) => {
  if (err) return console.error(err);
  console.log('server is listing on port 7002...')
});
