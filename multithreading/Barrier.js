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

    incrementCounter(value = 1) {
      return Atomics.add(barriers, this._counterIndex, value);
    }

    resetCounter() {
      return Atomics.store(barriers, this._counterIndex, 0);
    }

    set releaseFlag (value) {
      return Atomics.store(barriers, this._releaseFlagIndex, value)
    }

    get reversedLocalsence () {
      if (this.localsense) return 0;
      return 1;
    }

    switchReleaseFlag() {
      this.localsense = this.reversedLocalsence;
    }

    waitForRelease() {
      Atomics.notify(barriers, this._releaseFlagIndex);

      while (true) {
        const value = Atomics.wait(barriers, this._releaseFlagIndex, this.reversedLocalsence);

        if (value !== 'ok') return;
      }
    }
  
    enter() {
      this.switchReleaseFlag();
      this.lock.doWithLock(() => {
        this.incrementCounter();
        if (this.counter === this.threadsCount) {
          this.resetCounter();
          this.releaseFlag = this.localsense;
        }
      });
      this.waitForRelease();
    }
  }
  
  return Barrier;
};
