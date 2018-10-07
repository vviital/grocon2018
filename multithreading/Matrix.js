const helpers = require('./helpers')

class Matrix {
  constructor(options) {
    this.size = options.size || 0;
    
    this.memory = options.memory || helpers.generateFlatMatrix(this.size);
  }

  set(i, j, value) {
    const index = i * this.size + j;

    this.memory[index] = value;
  }

  get(i, j) {
    const index = i * this.size + j;
    return this.memory[index];
  }

  setAtomic(i, j, value) {
    const index = i * this.size + j;

    Atomics.store(this.memory, index, value);
  }

  getAtomic(i, j) {
    const index = i * this.size + j;
    return Atomics.load(this.memory, index);
  }

  print() {
    for (let i = 0; i < this.size; ++i) {
      for (let j = 0; j < this.size; ++j) {
        process.stdout.write(`${this.get(i, j)}`);
        if (j === this.size - 1) {
          process.stdout.write('\n');
        } else {
          process.stdout.write(',\t');
        }
      }
      process.stdout.write('\n');
    }
  }
  
  isEqual(matrix) {
    for (let i = 0; i < this.size; ++i) {
      for (let j = 0; j < this.size; ++j) {
        if (this.get(i, j) !== matrix.get(i, j)) {
          console.log(this.get(i, j), matrix.get(i, j));
          console.log(i, j);
          return false;
        }
      }
    }
    return true;
  }
}

module.exports = Matrix;
