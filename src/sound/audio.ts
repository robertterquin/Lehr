// Parol's sound, made live with Web Audio from the recipes in the sound sheet (design DS02): capiz bells,
// a bamboo knock, paper noise, a kulintang gong and a heartbeat, plus music that adds a layer every 10 rings.
// Browsers only allow sound after a tap, so nothing plays until `unlockAudio` runs inside a user input.

type Voice = (at: number) => void

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null
let muted = false
let vibration = true

const MUTE_KEY = 'parol-muted'
try {
  muted = localStorage.getItem(MUTE_KEY) === '1'
} catch {
  // Storage can be blocked (private mode): sound simply starts on.
}

/** Starts (or wakes) the audio context. Call from inside a tap, click or key press. */
export const unlockAudio = () => {
  if (!ctx) {
    ctx = new AudioContext()
    // A gentle limiter so overlapping bells and the gong never clip.
    const limiter = new DynamicsCompressorNode(ctx, { threshold: -6, knee: 6, ratio: 8, attack: 0.003, release: 0.25 })
    master = new GainNode(ctx, { gain: muted ? 0 : 1 })
    master.connect(limiter).connect(ctx.destination)
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

export const isMuted = () => muted

/** Mutes sound; the choice is remembered on this device. */
export const setMuted = (value: boolean) => {
  muted = value
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    // Not remembered when storage is blocked; the toggle still works for this visit.
  }
  if (ctx && master) master.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.02)
  if (value) stopMusic()
}

/** A decaying sine partial: `amp` after an `attack`, falling by e every `decay` seconds; optional 5 Hz shimmer. */
const partial = (out: AudioNode, at: number, freq: number, amp: number, decay: number, attack = 0.004, shimmer = 0) => {
  if (!ctx) return
  const osc = new OscillatorNode(ctx, { frequency: freq })
  const env = new GainNode(ctx, { gain: 0 })
  env.gain.setValueAtTime(0, at)
  env.gain.linearRampToValueAtTime(amp, at + attack)
  env.gain.setTargetAtTime(0, at + attack, decay)
  osc.connect(env).connect(out)
  if (shimmer) {
    const lfo = new OscillatorNode(ctx, { frequency: 5 })
    lfo.connect(new GainNode(ctx, { gain: shimmer })).connect(osc.frequency)
    lfo.start(at)
    lfo.stop(at + attack + decay * 7)
  }
  osc.start(at)
  osc.stop(at + attack + decay * 7)
}

/** A burst of noise through a band-pass around `center`, decaying by e every `decay` seconds. */
const burst = (out: AudioNode, at: number, seconds: number, amp: number, center: number, decay: number) => {
  if (!ctx || !noise) return
  const source = new AudioBufferSourceNode(ctx, { buffer: noise })
  const band = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: center, Q: 2 })
  const env = new GainNode(ctx, { gain: 0 })
  env.gain.setValueAtTime(0, at)
  // ×2 matches the design's state-variable filter, which peaks at twice the input.
  env.gain.linearRampToValueAtTime(amp * 2, at + 0.002)
  env.gain.setTargetAtTime(0, at + 0.002, decay)
  source.connect(band).connect(env).connect(out)
  source.start(at, Math.random() * 0.5)
  source.stop(at + seconds)
}

const bell = (out: AudioNode, at: number, freq: number, amp: number, decay = 1.1) =>
  [[1, 1], [2.01, 0.45], [2.76, 0.32], [5.4, 0.12], [8.9, 0.05]].forEach(([ratio, gain], k) => partial(out, at, freq * ratio, amp * gain, decay / (1 + k * 0.6), 0.002, k === 0 ? 0.6 : 0))

const gong = (out: AudioNode, at: number, freq: number, amp: number) => {
  ;[[1, 1, 2.6], [1.52, 0.5, 1.8], [2.11, 0.32, 1.3], [2.98, 0.16, 0.8]].forEach(([ratio, gain, decay]) => partial(out, at, freq * ratio, amp * gain, decay, 0.008, 0.8))
  burst(out, at, 0.05, amp * 0.25, 900, 0.015)
}

/** D major pentatonic: the streak climbs it, D5 E5 F♯5 A5 B5. */
const PENTATONIC = [587.33, 659.25, 739.99, 880, 987.77]

/** Each sound with the loudness the design's normaliser gave it (about −1 dBFS), then its mix level. */
const sound = (gain: number, make: (out: AudioNode, at: number) => void): Voice => (at) => {
  if (!ctx || !master || muted) return
  const out = new GainNode(ctx, { gain })
  out.connect(master)
  make(out, at)
}

export const SOUNDS = {
  // −9 dB: the whoosh sits under the locks.
  ringIn: sound(3.92 * 0.35, (o, t) => burst(o, t, 0.35, 0.5, 700, 0.12)),
  perfect: PENTATONIC.map((freq) => sound(0.75 * 0.8, (o, t) => { partial(o, t, 520, 0.4, 0.05, 0.001); bell(o, t + 0.01, freq, 0.55) })),
  widen: sound(0.56 * 0.7, (o, t) => PENTATONIC.forEach((freq, i) => bell(o, t + i * 0.07, freq * 2, 0.32, 0.9))),
  trim: sound(2.03, (o, t) => {
    partial(o, t, 520, 0.4, 0.05, 0.001)
    for (let k = 0; k < 7; k += 1) burst(o, t + 0.02 + k * 0.018, 0.05, 0.35 - k * 0.03, 1800 + k * 260, 0.02)
    burst(o, t + 0.15, 0.4, 0.2, 500, 0.15)
  }),
  danger: sound(1.07 * 0.8, (o, t) => { partial(o, t, 72, 0.9, 0.09); partial(o, t + 0.22, 66, 0.7, 0.1) }),
  milestone: sound(0.63, (o, t) => { gong(o, t, 196, 0.55); [880, 1174.66, 1318.51].forEach((freq, i) => bell(o, t + 0.18 + i * 0.09, freq, 0.16, 1.4)) }),
  end: sound(0.71, (o, t) => [587.33, 493.88, 392].forEach((freq, i) => bell(o, t + i * 0.32, freq, 0.42, 1.3))),
  starRises: sound(0.47, (o, t) => {
    gong(o, t, 98, 0.6)
    ;[...PENTATONIC.map((f) => f / 2), ...PENTATONIC, ...PENTATONIC.map((f) => f * 2)].forEach((freq, i) => bell(o, t + 0.2 + i * 0.11, freq, 0.22, 1.6))
  }),
}

/** Plays a sound now (a few ms ahead, so its envelope starts cleanly). */
export const play = (voice: Voice, delay = 0) => ctx && voice(ctx.currentTime + 0.005 + delay)

/** Turns phone vibration on or off (the Settings switch). */
export const setVibration = (on: boolean) => {
  vibration = on
}

/** A short vibration on phones that support it (Android; iPhones don't allow it on the web). */
export const buzz = (pattern: number | number[]) => {
  // Browsers refuse (and log) vibration before the person has tapped the page.
  if (vibration && 'vibrate' in navigator && navigator.userActivation?.hasBeenActive !== false) navigator.vibrate(pattern)
}

// ── Music: one loop that gains a layer every 10 rings ─────────────────────────────────────────────

const STEP = 60 / 92 / 2 // eighth notes at 92 bpm
const ARPEGGIO = [293.66, 369.99, 440, 493.88, 440, 369.99, 329.63, 440] // D4 F♯4 A4 B4 A4 F♯4 E4 A4
let musicBus: GainNode | null = null
let pad: OscillatorNode[] = []
let timer = 0
let nextStep = 0
let step = 0
let layers = 0

/** How many layers play: one more at 10, 20, 30, 40, 60 and 80 rings. */
export const musicLayers = (rings: number) => [10, 20, 30, 40, 60, 80].filter((at) => rings >= at).length

const schedule = () => {
  if (!ctx || !musicBus) return
  while (nextStep < ctx.currentTime + 0.12) {
    const t = nextStep
    const beat = step % 16
    if (layers >= 2 && beat % 2 === 0) bell(musicBus, t, ARPEGGIO[(beat / 2) % 8], 0.07, 1.2)
    if (layers >= 3 && beat % 4 === 0) partial(musicBus, t, beat % 8 === 0 ? 73.42 : 110, 0.18, 0.5, 0.01)
    if (layers >= 4 && beat % 2 === 1) burst(musicBus, t, 0.06, beat % 4 === 3 ? 0.08 : 0.04, 6500, 0.025)
    if (layers >= 5 && (step * 7) % 5 === 0) bell(musicBus, t, PENTATONIC[(step * 3) % 5] * 2, 0.03, 0.7)
    if (layers >= 6 && beat % 8 === 4) bell(musicBus, t, ARPEGGIO[(Math.floor(step / 8) + 2) % 8] * 1.5, 0.05, 1.6)
    nextStep += STEP
    step += 1
  }
}

/** Sets the music to the layers for `rings`; the first layer is a soft D drone. */
export const setMusic = (rings: number) => {
  if (!ctx || !master || muted) return
  const wanted = musicLayers(rings)
  if (wanted === layers && musicBus) return
  layers = wanted
  if (!musicBus) {
    musicBus = new GainNode(ctx, { gain: 0 })
    musicBus.connect(master)
    musicBus.gain.setTargetAtTime(0.5, ctx.currentTime, 0.8)
    nextStep = ctx.currentTime + 0.1
    timer = window.setInterval(schedule, 25)
  }
  if (layers >= 1 && pad.length === 0) {
    pad = [146.83, 220].map((freq) => {
      const osc = new OscillatorNode(ctx!, { frequency: freq })
      const level = new GainNode(ctx!, { gain: 0 })
      level.gain.setTargetAtTime(0.035, ctx!.currentTime, 1.5)
      osc.connect(level).connect(musicBus!)
      osc.start()
      return osc
    })
  }
}

/** Fades the music out (pause, run end, mute). */
export const stopMusic = () => {
  window.clearInterval(timer)
  if (ctx && musicBus) {
    const bus = musicBus
    bus.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
    const oscillators = pad
    window.setTimeout(() => {
      oscillators.forEach((osc) => osc.stop())
      bus.disconnect()
    }, 2000)
  }
  musicBus = null
  pad = []
  layers = 0
  step = 0
}
