const common = require('../../http2-common/index');

const fastify = require('fastify')({
  http2: true,
  https: common.options,
});

fastify.get('/', function (request, reply) {
  const req = request.raw;
  if (req.httpVersion === '2.0') {
    const { stream } = req;

    if (!stream.pushAllowed) return common.index;

    const cachedUnicorns = common.unicorns.slice(0, 3);

    cachedUnicorns.forEach((unicorn) => {
      stream.pushStream({ ':path': unicorn.path }, (err, pushStream) => {
        if (err) throw err;

        pushStream.respond({ ':status': 200 });
        pushStream.end(JSON.stringify(unicorn));
      });
    });
  }

  reply
    .code(200)
    .header('content-type', 'text/html')
    .send(common.index);
});

fastify.get('/unicorns/:id', async (request, reply) => {
  const id = request.params.id;
  const unicorn = common.unicorns[id - 1] || {};

  await common.sleep(1000);

  reply
    .code(200)
    .header('content-type', 'application/json')
    .send(unicorn);
});

fastify.listen(7003);

console.log('server is listening on port 7003');
