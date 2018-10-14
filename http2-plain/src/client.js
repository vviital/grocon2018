const http2 = require('http2');

const clientSession = http2.connect('http://localhost:80');

const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS
} = http2.constants;

const req = clientSession.request({ [HTTP2_HEADER_PATH]: '/' });

req.on('response', (headers) => {
  console.log(headers[HTTP2_HEADER_STATUS]);
  let data = '';
  req.on('data', (chunk) => { data += chunk; });
  req.on('end', () => console.log(data));
});
