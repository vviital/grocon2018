const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('signals');

const results = {
  single: {},
  multi: {},
};

const processSingle = (data, size) => {
  if (!results.single[size]) {
    results.single[size] = 0;
  }
  results.single[size] += data.diff;
};

const processMultiCore = (data, size, cores) => {
  if (!results.multi[cores]) {
    results.multi[cores] = {};
  }

  if (!results.multi[cores][size]) {
    results.multi[cores][size] = 0;
  }
  results.multi[cores][size] = data.diff;
};

const normalizeSingle = () => {
  Object.keys(results.single).forEach((key) => {
    results.single[key] /= 8;
  });
}

const printCSV = () => {
  const keys = Object.keys(results.single);

  const header = ['Item Name', 'Group 1'];

  Object.keys(results.multi).forEach(core => {
    header.push(`Group ${+core + 1}`);
  });

  fs.writeFileSync('results.csv', header.join(', '));
  fs.appendFileSync('results.csv', '\n');

  keys.forEach((key) => {
    const line = [];

    line.push(...[+key, results.single[key]]);

    const cores = Object.keys(results.multi);

    cores.forEach((core) => {
      line.push(results.multi[core][key]);
    });

    fs.appendFileSync('results.csv', line.join(', '));
    fs.appendFileSync('results.csv', '\n');
  });
};

const processFile = (filepath, cores, size) => {
  const data = require(path.resolve(__dirname, filepath));

  processSingle(data.single, size);
  processMultiCore(data.multi, size, cores);
};

files.forEach((file) => {
  const dirpath= path.join('signals', file);
  const stats = fs.statSync(dirpath);

  if (!stats.isDirectory()) return;

  const files = fs.readdirSync(dirpath);

  files.forEach((filename) => {
    const filepath = path.join(dirpath, filename);
    processFile(filepath, file, filename.match(/([0-9]*)/)[0]);
  });
});

normalizeSingle();

printCSV();
