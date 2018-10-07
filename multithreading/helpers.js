const _ = require('lodash');

const generateRandomArray = function (size, { zeros = [], min = 10, max = 1000 }) {
  const array = _.times(size, (index) => {
    if (zeros.includes(index)) return 0;
    
    return _.random(min, max);
  });

  return array;
};

const generateMatrix = (size) => {
  const matrix = _.times(size).map((_, index) => {
    const line = generateRandomArray(size, { zeros: [index] });

    return line;
  });

  return matrix;
};

const generateFlatMatrix = (size) => {
  const matrix = _.times(size).reduce((acc, index) => {
    return acc.concat(generateRandomArray(size, { zeros: [index] }));
  }, []);

  return matrix;
}

const printMatrix = (matrix = []) => {
  matrix.forEach((line) => {
    console.log(line.join(',\t'));
  });
};

module.exports = {
  generateFlatMatrix,
  generateMatrix,
  generateRandomArray,
  printMatrix,
};
