const common = require('../../http2-common/index');

const express = require('express');

const app = express();

app.get('/', () => {});

app.get('/unicorns/:id', () => {});

common.createSecureServer(app).listen(7004);

console.log('server is listening on port 7004');
