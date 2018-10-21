const { Worker, MessageChannel } = require('worker_threads');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Matrix = require('../../Matrix');

const threadsCount = +process.env.CORES || require('os').cpus().length;

const createWorker = (options) => {
  const { size, array, id, locks, barriers } = options;

  const filename = path.resolve(__dirname, 'parallel-floyd.js');
  const workerData = { size, id, threadsCount };

  const worker = new Worker(filename, { workerData });
  const channel = new MessageChannel();

  const message = {
    array,
    barriers,
    channel: channel.port1,
    locks,
  };

  worker.postMessage(message, [channel.port1]);
  worker.channel = channel.port2;

  return worker;
};

const calculateDistances = (flatMatrix, size) => {
  return new Promise((resolve, reject) => {
    const buffer = new SharedArrayBuffer(size * size * Int32Array.BYTES_PER_ELEMENT);
    const array = new Int32Array(buffer);
    const locks = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
    const barriers = new Int32Array(new SharedArrayBuffer(2 * Int32Array.BYTES_PER_ELEMENT));

    const matrix = new Matrix({ size, memory: array });
  
    for (let i = 0; i < flatMatrix.length; ++i) {
      array[i] = flatMatrix[i];
    }

    let remain = threadsCount;
    const options = { array, barriers, locks, size };
    const workers = _.times(threadsCount).map((id) => createWorker({ ...options, id }));
  
    workers.forEach(worker => worker
      .on('exit', () => {
        remain--;
        if (remain === 0) resolve(matrix);
      })
      .on('error', reject)
    );
  }); 
};

module.exports = {
  calculateDistances,
};
