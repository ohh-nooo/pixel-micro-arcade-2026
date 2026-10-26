export function createReaction(api, { autoAt = 3.4, delay = 1, reason, sound = "crash", onStart } = {}) {
  let t = 0;
  let stateT = 0;
  let started = false;
  let reported = false;

  function start() {
    if (started) return false;
    started = true;
    stateT = 0;
    onStart?.();
    if (sound) api.audio[sound]?.();
    return true;
  }

  function update(dt) {
    t += dt;

    if (!started) {
      if (t >= autoAt) start();
      return;
    }

    stateT += dt;
    if (stateT >= delay && !reported) {
      reported = true;
      api.lose(reason);
    }
  }

  return {
    start,
    update,
    get t() {
      return t;
    },
    get started() {
      return started;
    },
    get stateT() {
      return stateT;
    },
    get p() {
      return Math.min(1, stateT / delay);
    },
  };
}
