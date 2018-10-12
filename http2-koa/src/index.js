const koa = require('koa');
const Router = require('koa-router');
const _ = require('lodash');

const common = require('../../http2-common');

const app = new koa();
const router = new Router();

const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

router.get('/unicorns/:id', async (ctx) => {
  await sleep(1000);

  const unicorn = { ...(common.unicorns[ctx.params.id - 1] || {}) };
  unicorn.query = !_.isEmpty(ctx.query) ? ctx.query : undefined;

  ctx.body = JSON.stringify(unicorn);
  ctx.set('x-magic-header', 'magic');
  ctx.set('content-type', 'application/json');
});

router.get('/', (ctx) => {
  ctx.body = common.index;
  
  if (ctx.req.httpVersion === '2.0') {
    const { stream } = ctx.req;

    if (!stream.pushAllowed) return;

    const cachedUnicorns = common.unicorns.slice(0, 3);

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

common.server.on('request', app.callback());
common.server.listen(7001);

console.log('server is listing on port 7001...');
