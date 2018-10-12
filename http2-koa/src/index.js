const koa = require('koa');
const Router = require('koa-router');
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

const app = new koa();
const router = new Router();

const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

router.get('/unicorns/:id', async (ctx) => {
  await sleep(1000);

  const unicorn = { ...(unicorns[ctx.params.id - 1] || {}) };
  unicorn.query = !_.isEmpty(ctx.query) ? ctx.query : undefined;

  ctx.body = JSON.stringify(unicorn);
  ctx.set('x-magic-header', 'magic');
  ctx.set('content-type', 'application/json');
});

router.get('/', (ctx) => {
  ctx.body = index;
  
  if (ctx.req.httpVersion === '2.0') {
    const { stream } = ctx.req;

    if (!stream.pushAllowed) return;

    const cachedUnicorns = unicorns.slice(0, 3);

    cachedUnicorns.forEach((unicorn) => {
      stream.pushStream({ ':path': unicorn.path }, (err, pushStream) => {
        if (err) throw err;

        pushStream.respond({ ':status': 200 });
        pushStream.end(JSON.stringify(unicorn));
      });
    });
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const server = http2.createSecureServer(options, app.callback());
server.listen(7001);

console.log('server is listing on port 7001...');
