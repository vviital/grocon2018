const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const root = 'results';
const files = fs.readdirSync(root);

const results = {
  single: {},
  multi: {},
};

const processSingle = (files, size) => {
  const values = files.map((file) => {
    const value = require(file);
    return value.single.diff;
  });

  const minimum = _.min(values);

  const mean = _.mean(values.filter(value => value < 2 * minimum));
  
  if (!results.single[size]) {
    results.single[size] = 0;
  }
  results.single[size] += mean;
};


const processMultiCore = (files, size, cores) => {
  const values = files.map((file) => {
    const value = require(file);
    return value.multi.diff;
  });

  const minimum = _.min(values);
  
  const mean = _.mean(values.filter(value => value < 2 * minimum));
  
  if (!results.multi[cores]) {
    results.multi[cores] = {};
  }

  results.multi[cores][size] = mean;
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

const processFile = (subdirpath, cores, size) => {
  const files = fs.readdirSync(subdirpath);

  const filenames = files.map(file => path.resolve(__dirname, subdirpath, file));

  processSingle(filenames, size);
  processMultiCore(filenames, size, cores);
};

files.forEach((file) => {
  const dirpath= path.join(root, file);
  const stats = fs.statSync(dirpath);

  if (!stats.isDirectory()) return;

  const subdirs = fs.readdirSync(dirpath);

  subdirs.forEach((subdirname) => {
    const subdirpath = path.join(dirpath, subdirname);
    processFile(subdirpath, file, subdirname.match(/([0-9]*)/)[0]);
  });
});

normalizeSingle();

printCSV();
