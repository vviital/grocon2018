const http2 = require('http2');
const path = require('path');
const fs = require('fs');
const faker = require('faker');

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

module.exports = {
  index,
  options,
  server: http2.createSecureServer(options),
  createServer: (callback) => http2.createServer(options, callback),
  createSecureServer: (callback) => http2.createSecureServer(options, callback),
  sleep,
  unicorns,
}
