const { workerData, parentPort } = require('worker_threads');
const Matrix = require('../../Matrix');

const { size, id, threadsCount } = workerData;

const part = Math.ceil(size / threadsCount);
const FROM = part * id;
const TO = Math.min(size, FROM + part);

const calculateDistance = async (matrix, barrier) => {
  for (let k = 0; k < matrix.size; ++k) {
    const array = [];

    barrier.enter();

    for (let i = 0; i < matrix.size; ++ i) {
      array.push(matrix.get(k, i));
    }

    barrier.enter();

    for (let i = FROM; i < TO; ++i) {
      let iTok = matrix.get(i, k);
      for (let j = 0; j < matrix.size; ++j) {
        const nextLength = iTok + array[j];
        if (matrix.get(i, j) > nextLength) {
          matrix.set(i, j, nextLength);
        }
      }
    }
  }
};

parentPort.once('message', async (msg) => {
  const { array, locks, barriers } = msg;

  const Barrier = require('../../Barrier')(barriers, locks);

  const matrix = new Matrix({ size, memory: array });
  const barrier = new Barrier({ threadsCount, id });

  await calculateDistance(matrix, barrier);
});
