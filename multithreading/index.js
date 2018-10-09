const { multiThreadsVersion } = require('./src/index');
const helpers = require('./helpers');

const run = async () => {
  const size = 1000;
  const flatMatrix = helpers.generateFlatMatrix(size);

  debugger;

  const result = await multiThreadsVersion.calculateDistances(flatMatrix, size);

  return result;
};

run().then(() => console.log('finished...')).catch(console.error.bind(console));
