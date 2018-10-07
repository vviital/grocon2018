const fs = require('fs');

const helpers = require('../helpers');

const { singleThreadVersion, multiThreadsVersion } = require('../src');

const Matrix = require('../Matrix');

jest.setTimeout(60000);

const size = +process.env.SIZE;
const cores = +process.env.CORES;

console.log('cores', cores);

describe('Floyd algorithm', () => {
  const results = {};
  const generateTest = (size) => {
    describe(`#size = ${size}`, () => {
      const flatMatrix = helpers.generateFlatMatrix(size);

      const scope = {};
  
      afterAll(() => {
        const isEqual = scope.single.isEqual(scope.multi);

        expect(isEqual).toBeTruthy();

        const directory = `signals/${cores}`;

        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory);
        }

        fs.writeFileSync(`${directory}/${size}.json`, JSON.stringify(results[size], ' ', 1));
      });
  
      it('should calculate final matrix at single tread', async () => {
        const first = performance.now();
        const result = await singleThreadVersion.calculateDistances([...flatMatrix], size);
        const second = performance.now();

        results[size] = results[size] || {};
        results[size].single = { first, second, diff: second - first };
  
        scope.single = result;
      });
  
      it('should calculate final matrix at multi treads', async () => {
        const first = performance.now();
        const result = await multiThreadsVersion.calculateDistances([...flatMatrix], size);
        const second = performance.now();
        scope.multi = result;

        results[size] = results[size] || {};
        results[size].multi = { first, second, diff: second - first };
      });
    })
  };

  // afterAll(() => {
  //   fs.writeFileSync('results.json', JSON.stringify(results, ' ', 1));
  // })

  generateTest(size);
});
