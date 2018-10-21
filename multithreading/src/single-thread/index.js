const Matrix = require('../../Matrix');

const calculateDistances = async (flatMatrix, size) => {
  const matrix = new Matrix({ size, memory: flatMatrix });

  for (let k = 0; k < matrix.size; k++) {
    const array = [];

    for (let i = 0; i < matrix.size; ++ i) {
      array.push(matrix.get(k, i));
    }

    for (let i = 0; i < matrix.size; i++) {
      let iToK = matrix.get(i, k);

      for (let j = 0; j < matrix.size; ++j) {
        const nextLength = iToK + array[j];
        const currentLength = matrix.get(i, j);
        const value = nextLength > currentLength ? currentLength : nextLength;

        matrix.set(i, j, value);
      }
    }
  }

  return matrix;
};

module.exports = {
  calculateDistances,
}
