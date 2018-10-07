const Lock = require('./Lock');

module.exports = (barriers, locks) => {
  class Barrier {
    constructor({ threadsCount, id }) {
      this.threadsCount = threadsCount;
      this.localsense = 0;
      this.lock = new Lock(locks, 0);
      this.lock.id = id;
      this.id = id;
    }

    get counter() {
      return Atomics.load(barriers, 0);
    }

    _incrementCounter(value = 1) {
      return Atomics.add(barriers, 0, value);
    }

    _resetCounter() {
      return Atomics.store(barriers, 0, 0);
    }

    _setReleaseFlag() {
      return Atomics.store(barriers, 1, this.localsense);
    }

    _reversedReleaseFlag () {
      if (this.localsense) return 0;
      return 1;
    }

    _flipReleaseFlag() {
      this.localsense = this._reversedReleaseFlag();
    }

    _waitForRelease() {
      Atomics.notify(barriers, 1);

      while (true) {
        const value = Atomics.wait(barriers, 1, this._reversedReleaseFlag());

        if (value !== 'ok') return;
      }
    }
  
    enter() {
      this._flipReleaseFlag();
      this.lock.doWithLock(() => {
        this._incrementCounter();
        if (this.counter === this.threadsCount) {
          this._resetCounter();
          this._setReleaseFlag();
        }
      });
      this._waitForRelease();
    }
  }
  
  return Barrier;
};
