const { Server } = require('hapi');
const http2 = require('http2');
const path = require('path');
const fs = require('fs');
const faker = require('faker');
const _ = require('lodash');

const unicorns = [1, 2, 3, 4, 5, 6].map(number => ({
  id: number,
  name: faker.name.findName(),
  path: `/unicorns/${number}`,
}));

const options = {
  key: fs.readFileSync(path.resolve(process.cwd(), 'creds', 'self.key')),
  cert: fs.readFileSync(path.resolve(process.cwd(), 'creds', 'self.cert')),
};

const index = fs.readFileSync(path.join(process.cwd(), 'assets', 'index.html')).toString();

const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const listener = http2.createSecureServer(options);

const app = new Server({
  listener,
  port: 7002,
});

app.version

app.route([{
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    const { req } = request.raw;

    if (req.httpVersion === '2.0') {
      const { stream } = req;
  
      if (!stream.pushAllowed) return index;
  
      const cachedUnicorns = unicorns.slice(0, 3);
  
      cachedUnicorns.forEach((unicorn) => {
        stream.pushStream({ ':path': unicorn.path }, (err, pushStream) => {
          if (err) throw err;
  
          pushStream.respond({ ':status': 200 });
          pushStream.end(JSON.stringify(unicorn));
        });
      });
    }

    return index;
  },
 }, {
   method: 'GET',
   path: '/unicorns/{id}',
   handler: async (request, h) => {
    const id = request.params.id;
    const unicorn = unicorns[id - 1] || {};

    await sleep(1000);

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
