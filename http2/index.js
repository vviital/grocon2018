// const fs = require('fs');
// const http2 = require('http2');
// const koa = require('koa');
// const path = require('path');

// const options = {
//   key: fs.readFileSync(path.resolve(process.cwd(), 'creds', 'self.key')),
//   cert: fs.readFileSync(path.resolve(process.cwd(), 'creds', 'self.cert')),
// };

// const app = new koa();
// // response
// app.use(ctx => {
//   console.log('here', ctx.req.stream);
//   ctx.body = 'Hello Koa';
// });

// const server = http2.createSecureServer(options, app.callback());
// server.listen(9999);


const express = require('express');
const http2 = require('http2');
const fs = require('fs');
const path = require('path');

const app = express();

app.get('/', function (req, res) {
  res.send('Serving using HTTP2!');
});

const options = {
  key: fs.readFileSync(path.resolve(process.cwd(), 'creds', 'self.key')),
  cert: fs.readFileSync(path.resolve(process.cwd(), 'creds', 'self.cert')),
};

http2
  .createSecureServer(options, app)
  .listen(3000, (err) => {
    if (err) {
      throw new Error(err);
    }

    console.log('Listening on port: ' + 3000 + '.');
  });
