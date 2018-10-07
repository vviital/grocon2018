const Lock = require('./Lock');

module.exports = (barriers, locks) => {
  class Barrier {
    constructor({ threadsCount }) {
      this.threadsCount = threadsCount;
      this.localsense = 0;
      this.lock = new Lock(locks, 0);

      this._counterIndex = 0;
      this._releaseFlagIndex = 1;
    }

    get counter() {
      return Atomics.load(barriers, this._counterIndex);
    }

    get reversedLocalsence () {
      if (this.localsense) return 0;
      return 1;
    }

    waitForRelease() {
      Atomics.notify(barriers, this._releaseFlagIndex);

      while (true) {
        const value = Atomics.wait(barriers, this._releaseFlagIndex, this.reversedLocalsence);

        if (value !== 'ok') return;
      }
    }
  
    enter() {
      this.localsense = this.reversedLocalsence;
      this.lock.doWithLock(() => {
        Atomics.add(barriers, this._counterIndex, 1);
        if (this.counter === this.threadsCount) {
          Atomics.store(barriers, this._counterIndex, 0);
          Atomics.store(barriers, this._releaseFlagIndex, this.localsense);
        }
      });
      this.waitForRelease();
    }
  }
  
  return Barrier;
};
