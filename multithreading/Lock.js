const FREE = 0;
const LOCKED_WITH_WAITERS = 1;
const LOCKED = 2;

class Lock {
  constructor(locks, index) {
    this._locks = locks;
    this._index = index;
  }

  _tryLock(prevState = FREE, nextState = LOCKED) {
    this.previousState = Atomics.compareExchange(this._locks, this._index, prevState, nextState);

    return this.previousState;
  }

  lock() {
    this._tryLock();
    if (this.previousState === FREE) {
      return;
    }

    do {
      const { previousState } = this;
      const condition = previousState === LOCKED_WITH_WAITERS
        || (this._tryLock(LOCKED, LOCKED_WITH_WAITERS) !== FREE);

      if (condition) {
        Atomics.wait(this._locks, this._index, LOCKED_WITH_WAITERS, 100);
      }

    } while (this._tryLock(FREE, LOCKED_WITH_WAITERS) !== FREE);
  }

  doWithLock(fn) {
    this.lock();
    fn();
    this.unlock();
  }

  unlock() {
    const previousState = Atomics.sub(this._locks, this._index, 1);

    if (previousState !== LOCKED_WITH_WAITERS) {
      Atomics.store(this._locks, this._index, FREE);
      Atomics.notify(this._locks, this._index, 1);
    }
  }
}

module.exports = Lock;
