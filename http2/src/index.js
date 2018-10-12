const common = require('../../http2-common/index');

const port = process.env.PORT || 7000;

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

const pushUnicorns = (stream) => {
  const cachedUnicorns = common.unicorns.slice(0, 3);

  if (!stream.pushAllowed) return;

  cachedUnicorns.forEach((unicorn) => {
    stream.pushStream({ ':path': unicorn.path }, pushContent.bind(null, unicorn));
  });
}

const start = () => {
  const listener = async (req, res) => {
    if (req.httpVersion !== '2.0') {
      return res.end(JSON.stringify({ version: req.httpVersion }));
    }

    await sleep(500);

    loggerRequest(req);
    const { headers } = req;
    const route = headers[':path'];
    if (route === '/') {
      res.end(common.index);
    } else if (route.includes('unicorns')) {
      const id = +route.replace('/unicorns/', '');
      const unicorn = common.unicorns.find(v => v.id === id);

      if (!unicorn) return !notFound(res);

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(unicorn));
    } else {
      notFound(res);
    }
  };

  common.server.on('stream', (stream, headers) => {
    if (headers[':path'] === '/') {
      return pushUnicorns(stream);
    }
  });

  common.server.listen(port);
  common.server.on('request', listener);

  console.log(`server is listening on port ${port}`);
};

start();
