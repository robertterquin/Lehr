// Parol star geometry and the scripted demo run. Same rules as the mockups:
// a perfect lock keeps the point width, an off-angle lock trims it by the error,
// and every 5th perfect in a row widens the points back by 6°.

export const PALETTE = ['#f4ecd8', '#d8342c', '#f2b632', '#2e9a5a', '#2f6fd0', '#c43a8a'];
export const BAMBOO = '#3b2414';
export const START_WIDTH = 36;
const PERFECT_WITHIN = 1.5;

const polar = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [150 + r * Math.cos(a), 150 + r * Math.sin(a)];
};
const path = (points: [number, number][]) => `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;

/** Every ring is the same star shape, scaled up, so the parol reads as nested star outlines. */
export const radii = (ring: number) => {
  const ro = 46 + ring * 9;
  const ri = ro * 0.44;
  return { ri, ro, rv: ri * 0.93 };
};

/** A five-pointed ring in a 300×380 box centred at (150, 150). */
export const starPath = (ring: number, width: number, rotation: number) => {
  const { ri, ro, rv } = radii(ring);
  const points: [number, number][] = [];
  for (let k = 0; k < 5; k++) {
    const t = rotation + k * 72 - 90;
    points.push(polar(ri, t - width / 2), polar(ro, t), polar(ri, t + width / 2), polar(rv, t + 36));
  }
  return path(points);
};

/** The overhang trimmed off when a ring locks `delta` degrees off. */
export const sliverPath = (ring: number, width: number, rotation: number, delta: number) => {
  const { ri, ro } = radii(ring);
  let d = '';
  for (let k = 0; k < 5; k++) {
    const t = rotation + k * 72 - 90;
    const a1 = delta > 0 ? t + width / 2 : t - width / 2 + delta;
    const a2 = delta > 0 ? t + width / 2 + delta : t - width / 2;
    d += path([polar(ri - 2, a1), polar(ro - 8, a1), polar(ro - 12, a2), polar(ri - 2, a2)]);
  }
  return d;
};

export type Ring = {
  index: number
  delta: number
  /** Width and rotation the ring spins in with (the ring inside it). */
  fromWidth: number
  fromRotation: number
  /** Width and rotation after the lock. */
  width: number
  rotation: number
  perfect: boolean
  widened: boolean
  streak: number
  startAt: number
  lockAt: number
  direction: 1 | -1
}

export type LockedRing = { index: number; width: number; rotation: number; perfect: boolean; widened: boolean; streak: number; fromWidth: number; fromRotation: number; delta: number };

/** Replays a list of lock errors (degrees) into ring shapes, using the game rules. */
export const playLocks = (deltas: number[]): LockedRing[] => {
  let width = START_WIDTH;
  let rotation = 0;
  let streak = 0;
  return deltas.map((delta, index) => {
    const fromWidth = width;
    const fromRotation = rotation;
    const perfect = Math.abs(delta) <= PERFECT_WITHIN;
    let widened = false;
    if (perfect) {
      streak += 1;
      widened = streak % 5 === 0;
      if (widened) width = Math.min(START_WIDTH, width + 6);
    } else {
      streak = 0;
      width -= Math.abs(delta);
      rotation += delta / 2;
    }
    return { index, width, rotation, perfect, widened, streak, fromWidth, fromRotation, delta };
  });
};

/** Lock errors in degrees for the demo run: 0 is perfect. */
const DEMO_LOCKS = [0, 0, 0, 6, 0, 0, 0, 0, 0, -4, 0, 0];

export const DEMO: Ring[] = (() => {
  let clock = 0.5;
  return playLocks(DEMO_LOCKS).map((locked) => {
    const spin = Math.max(0.7, 1.05 - locked.index * 0.03);
    const ring: Ring = { ...locked, startAt: clock, lockAt: clock + spin, direction: Math.floor(locked.index / 4) % 2 === 0 ? 1 : -1 };
    clock += spin + 0.28;
    return ring;
  });
})();

export const GAMEPLAY_SECONDS = DEMO[DEMO.length - 1].lockAt + 1.1;
export const PERFECT_COUNT = DEMO.filter((ring) => ring.perfect).length;
