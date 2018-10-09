const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const faker = require('faker');

const port = process.env.PORT || 7000;

const unicorns = [1, 2, 3, 4, 5, 6].map(number => ({
  id: number,
  name: faker.name.findName(),
  path: `/unicorns/${number}`,
}));

const index = fs.readFileSync(path.resolve(__dirname, 'index.html'));
const numbers = fs.readFileSync(path.resolve(__dirname, 'numbers.html'));

const options = {
  key: fs.readFileSync(path.resolve(process.cwd(), 'creds', 'self.key')),
  cert: fs.readFileSync(path.resolve(process.cwd(), 'creds', 'self.cert')),
  allowHTTP1: true,
  peerMaxConcurrentStreams: 1000,
};

const pushContent = (content, err, pushStream) => {
  if (err) throw err;

  pushStream.respond({ ':status': 200 });
  pushStream.end(JSON.stringify(content));
};

const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const notFound = (res) => {
  res.statusCode = 404;
  res.end('Not found');
};

const loggerRequest = (req) => {
  const { headers } = req;
  const route = headers[':path'];
  const method = headers[':method'];

  console.log(`${method} ${route}`);
};

const start = () => {
  const server = http2.createSecureServer(options, async (req, res) => {
    if (req.httpVersion !== '2.0') {
      return res.end(JSON.stringify({ version: req.httpVersion }));
    }

    await sleep(500);

    loggerRequest(req);
    const { headers } = req;
    const route = headers[':path'];
    if (route === '/') {
      res.end(index);
    } else if (route.includes('unicorns')) {
      const id = +route.replace('/unicorns/', '');
      const unicorn = unicorns.find(v => v.id === id);

      if (!unicorn) return !notFound(res);

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(unicorn));
    } else {
      notFound(res);
    }
  });

  const pushUnicorns = (stream) => {
    const cachedUnicorns = unicorns.slice(0, 3);

    if (!stream.pushAllowed) return;

    cachedUnicorns.forEach((unicorn) => {
      stream.pushStream({ ':path': unicorn.path }, pushContent.bind(null, unicorn));
    });
  }

  server.on('stream', (stream, headers) => {
    if (headers[':path'] === '/') {
      return pushUnicorns(stream);
    }
  });

  server.listen(port);

  console.log(`server is listening on port ${port}`);
};

start();
