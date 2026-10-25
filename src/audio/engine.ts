/* ============================================================
   Ses motoru — WebAudio ile tamamen sentezlenmiş ambiyans + müzik
   Harici ses dosyası gerekmez.
   ============================================================ */

export type AmbienceId = 'nature' | 'rain' | 'birds' | 'waves' | 'sunrise' | 'night'

type Stop = () => void

let ctx: AudioContext | null = null
let master: GainNode | null = null

function audio(): AudioContext {
  if (!ctx) {
    const Ctor: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
  }
  return ctx
}

function masterBus(): GainNode {
  const c = audio()
  if (!master) {
    master = c.createGain()
    master.gain.value = 0.55
    const comp = c.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.ratio.value = 5
    master.connect(comp).connect(c.destination)
  }
  return master
}

export function unlockAudio() {
  const c = audio()
  if (c.state === 'suspended') void c.resume()
}

export function setMasterVolume(v: number) {
  const bus = masterBus()
  bus.gain.setTargetAtTime(Math.max(0, Math.min(1, v)) * 0.8, audio().currentTime, 0.05)
}

/* ---------- yardımcılar ---------- */

function noiseBuffer(seconds = 4): AudioBuffer {
  const c = audio()
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i += 1) {
    // pembe gürültüye yakın: kahverengi gürültüyü hafifçe harmanla
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = white * 0.5 + last * 3.2
  }
  return buf
}

function loopNoise(seconds = 4): AudioBufferSourceNode {
  const c = audio()
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(seconds)
  src.loop = true
  return src
}

function lfo(rate: number, depth: number, target: AudioParam, base: number) {
  const c = audio()
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = rate
  const g = c.createGain()
  g.gain.value = depth
  target.value = base
  osc.connect(g).connect(target)
  osc.start()
  return () => {
    try {
      osc.stop()
    } catch {
      /* zaten durmuş */
    }
    osc.disconnect()
    g.disconnect()
  }
}

/* ============================================================
   Ambiyans üreticileri
   ============================================================ */

function makeNature(): Stop {
  const c = audio()
  const out = c.createGain()
  out.gain.value = 0.0001
  out.connect(masterBus())

  const wind = loopNoise(6)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 480
  bp.Q.value = 0.7
  const windGain = c.createGain()
  windGain.gain.value = 0.5
  wind.connect(bp).connect(windGain).connect(out)
  wind.start()

  const killLfo = lfo(0.07, 0.34, windGain.gain, 0.44)

  // yaprak hışırtısı: yüksek bantlı, aralıklı
  const leaves = loopNoise(5)
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 3200
  const lg = c.createGain()
  lg.gain.value = 0.1
  leaves.connect(hp).connect(lg).connect(out)
  leaves.start()
  const killLeaf = lfo(0.23, 0.08, lg.gain, 0.11)

  out.gain.setTargetAtTime(0.5, c.currentTime, 0.6)

  return () => {
    killLfo()
    killLeaf()
    out.gain.setTargetAtTime(0.0001, c.currentTime, 0.4)
    window.setTimeout(() => {
      try { wind.stop(); leaves.stop() } catch { /* */ }
      out.disconnect()
    }, 900)
  }
}

function makeRain(): Stop {
  const c = audio()
  const out = c.createGain()
  out.gain.value = 0.0001
  out.connect(masterBus())

  const hiss = loopNoise(6)
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 900
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 8200
  const g = c.createGain()
  g.gain.value = 0.42
  hiss.connect(hp).connect(lp).connect(g).connect(out)
  hiss.start()

  const kill = lfo(0.12, 0.14, g.gain, 0.42)

  // damlalar
  const dropTimer = window.setInterval(() => {
    if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = 1400 + Math.random() * 2400
    const dg = ctx.createGain()
    dg.gain.setValueAtTime(0.0001, t)
    dg.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, t + 0.004)
    dg.gain.exponentialRampToValueAtTime(0.0001, t + 0.11)
    osc.connect(dg).connect(out)
    osc.start(t)
    osc.stop(t + 0.14)
  }, 190)

  out.gain.setTargetAtTime(0.55, c.currentTime, 0.6)

  return () => {
    kill()
    window.clearInterval(dropTimer)
    out.gain.setTargetAtTime(0.0001, c.currentTime, 0.4)
    window.setTimeout(() => { try { hiss.stop() } catch { /* */ } out.disconnect() }, 900)
  }
}

function makeBirds(): Stop {
  const c = audio()
  const out = c.createGain()
  out.gain.value = 0.0001
  out.connect(masterBus())

  const bed = loopNoise(5)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 2600
  bp.Q.value = 0.5
  const bg = c.createGain()
  bg.gain.value = 0.16
  bed.connect(bp).connect(bg).connect(out)
  bed.start()

  const timers: number[] = []

  const chirp = () => {
    if (!ctx) return
    const t = ctx.currentTime
    const notes = 2 + Math.floor(Math.random() * 4)
    const base = 2100 + Math.random() * 1700
    for (let i = 0; i < notes; i += 1) {
      const st = t + i * (0.07 + Math.random() * 0.06)
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      const f0 = base * (0.9 + Math.random() * 0.25)
      osc.frequency.setValueAtTime(f0, st)
      osc.frequency.exponentialRampToValueAtTime(f0 * (1.18 + Math.random() * 0.3), st + 0.05)
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.94, st + 0.1)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, st)
      g.gain.exponentialRampToValueAtTime(0.09, st + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.12)
      osc.connect(g).connect(out)
      osc.start(st)
      osc.stop(st + 0.15)
    }
    timers.push(window.setTimeout(chirp, 700 + Math.random() * 2600))
  }
  chirp()

  out.gain.setTargetAtTime(0.5, c.currentTime, 0.6)

  return () => {
    timers.forEach((t) => window.clearTimeout(t))
    out.gain.setTargetAtTime(0.0001, c.currentTime, 0.4)
    window.setTimeout(() => { try { bed.stop() } catch { /* */ } out.disconnect() }, 900)
  }
}

function makeWaves(): Stop {
  const c = audio()
  const out = c.createGain()
  out.gain.value = 0.0001
  out.connect(masterBus())

  const surf = loopNoise(8)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 120
  const g = c.createGain()
  g.gain.value = 0.3
  surf.connect(hp).connect(lp).connect(g).connect(out)
  surf.start()

  // dalga kabarması
  const swell = lfo(0.1, 0.26, g.gain, 0.3)
  const swell2 = lfo(0.17, 0.1, lp.frequency, 900)

  out.gain.setTargetAtTime(0.55, c.currentTime, 0.7)

  return () => {
    swell()
    swell2()
    out.gain.setTargetAtTime(0.0001, c.currentTime, 0.4)
    window.setTimeout(() => { try { surf.stop() } catch { /* */ } out.disconnect() }, 900)
  }
}

function makeSunrise(): Stop {
  const c = audio()
  const out = c.createGain()
  out.gain.value = 0.0001
  out.connect(masterBus())

  // sıcak pad akoru
  const freqs = [130.81, 164.81, 196.0, 246.94, 329.63]
  const stops: (() => void)[] = []

  freqs.forEach((f, i) => {
    const osc = c.createOscillator()
    osc.type = i > 2 ? 'triangle' : 'sawtooth'
    osc.frequency.value = f
    const filt = c.createBiquadFilter()
    filt.type = 'lowpass'
    filt.frequency.value = 900 + i * 160
    const g = c.createGain()
    g.gain.value = 0.05 / (1 + i * 0.32)
    osc.connect(filt).connect(g).connect(out)
    osc.start()
    // hafif detune dalgalanması
    const k = lfo(0.05 + i * 0.017, 1.6 + i, osc.detune, 0)
    stops.push(() => {
      k()
      try { osc.stop() } catch { /* */ }
    })
  })

  out.gain.setTargetAtTime(0.62, c.currentTime, 0.9)

  return () => {
    stops.forEach((s) => s())
    out.gain.setTargetAtTime(0.0001, c.currentTime, 0.5)
    window.setTimeout(() => out.disconnect(), 1000)
  }
}

function makeNight(): Stop {
  const c = audio()
  const out = c.createGain()
  out.gain.value = 0.0001
  out.connect(masterBus())

  // cırcır böcekleri: yüksek, ritmik
  const timer = window.setInterval(() => {
    if (!ctx) return
    const t = ctx.currentTime
    for (let i = 0; i < 3; i += 1) {
      const st = t + i * 0.055
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.value = 4200 + Math.random() * 500
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, st)
      g.gain.exponentialRampToValueAtTime(0.035, st + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.042)
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 4200
      bp.Q.value = 6
      osc.connect(bp).connect(g).connect(out)
      osc.start(st)
      osc.stop(st + 0.06)
    }
  }, 1150)

  // alçak gece uğultusu
  const bed = loopNoise(6)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 320
  const bg = c.createGain()
  bg.gain.value = 0.3
  bed.connect(lp).connect(bg).connect(out)
  bed.start()
  const kill = lfo(0.06, 0.1, bg.gain, 0.3)

  out.gain.setTargetAtTime(0.5, c.currentTime, 0.7)

  return () => {
    window.clearInterval(timer)
    kill()
    out.gain.setTargetAtTime(0.0001, c.currentTime, 0.4)
    window.setTimeout(() => { try { bed.stop() } catch { /* */ } out.disconnect() }, 900)
  }
}

const AMB_BUILDERS: Record<AmbienceId, () => Stop> = {
  nature: makeNature,
  rain: makeRain,
  birds: makeBirds,
  waves: makeWaves,
  sunrise: makeSunrise,
  night: makeNight,
}

/* ============================================================
   Ambiyans yöneticisi
   ============================================================ */

const active = new Map<AmbienceId, Stop>()

export function toggleAmbience(id: AmbienceId): boolean {
  unlockAudio()
  const cur = active.get(id)
  if (cur) {
    cur()
    active.delete(id)
    return false
  }
  active.set(id, AMB_BUILDERS[id]())
  return true
}

export function isAmbienceOn(id: AmbienceId) {
  return active.has(id)
}

export function stopAllAmbience() {
  active.forEach((s) => s())
  active.clear()
}

/* ============================================================
   Müzik çalar — akor yürüyüşlü, sentezlenmiş enstrümantal
   ============================================================ */

export type SongSpec = {
  id: string
  bpm: number
  root: number
  chords: number[][]
}

export class MusicPlayer {
  private timer: number | null = null
  private step = 0
  private out: GainNode | null = null
  private spec: SongSpec | null = null
  private t0 = 0
  private totalSteps = 0
  private audioElement: HTMLAudioElement | null = null
  private useRealAudio = false

  onProgress: ((ratio: number) => void) | null = null
  onEnded: (() => void) | null = null

  get playing() {
    if (this.useRealAudio && this.audioElement) {
      return !this.audioElement.paused
    }
    return this.timer !== null
  }

  private bus(): GainNode {
    const c = audio()
    if (!this.out) {
      this.out = c.createGain()
      this.out.gain.value = 0.0001
      const verb = c.createConvolver()
      verb.buffer = this.impulse(1.9)
      const wet = c.createGain()
      wet.gain.value = 0.28
      this.out.connect(masterBus())
      this.out.connect(verb).connect(wet).connect(masterBus())
    }
    return this.out
  }

  private impulse(seconds: number): AudioBuffer {
    const c = audio()
    const len = Math.floor(c.sampleRate * seconds)
    const buf = c.createBuffer(2, len, c.sampleRate)
    for (let ch = 0; ch < 2; ch += 1) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < len; i += 1) {
        d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6
      }
    }
    return buf
  }

  private pluck(freq: number, at: number, dur: number, gain: number, type: OscillatorType) {
    const c = audio()
    const osc = c.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    const filt = c.createBiquadFilter()
    filt.type = 'lowpass'
    filt.frequency.setValueAtTime(Math.min(7000, freq * 6), at)
    filt.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 1.6), at + dur)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(gain, at + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    osc.connect(filt).connect(g).connect(this.bus())
    osc.start(at)
    osc.stop(at + dur + 0.05)
  }

  private bass(freq: number, at: number, dur: number) {
    const c = audio()
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(0.14, at + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    osc.connect(g).connect(this.bus())
    osc.start(at)
    osc.stop(at + dur + 0.05)
  }

  private hat(at: number, gain = 0.03) {
    const c = audio()
    const src = c.createBufferSource()
    const len = Math.floor(c.sampleRate * 0.05)
    const buf = c.createBuffer(1, len, c.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i += 1) d[i] = Math.random() * 2 - 1
    src.buffer = buf
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7000
    const g = c.createGain()
    g.gain.setValueAtTime(gain, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.045)
    src.connect(hp).connect(g).connect(this.bus())
    src.start(at)
    src.stop(at + 0.06)
  }

  private kick(at: number) {
    const c = audio()
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(120, at)
    osc.frequency.exponentialRampToValueAtTime(46, at + 0.14)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(0.22, at + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22)
    osc.connect(g).connect(this.bus())
    osc.start(at)
    osc.stop(at + 0.26)
  }

  private scheduleStep(step: number, at: number, beat: number) {
    const spec = this.spec
    if (!spec) return
    const bar = Math.floor(step / 4) % spec.chords.length
    const chord = spec.chords[bar]
    const inBar = step % 4

    // arpej
    chord.forEach((semi, i) => {
      const freq = 440 * 2 ** ((spec.root + semi - 69 + i * 0) / 12)
      const offset = i * beat * 0.24
      this.pluck(freq * 2, at + offset, beat * 1.5, 0.055 - i * 0.008, 'triangle')
    })

    if (inBar === 0) {
      this.bass(440 * 2 ** ((spec.root + chord[0] - 69) / 12) / 2, at, beat * 1.6)
      this.kick(at)
    }
    if (inBar === 2) this.kick(at)
    this.hat(at, 0.022)
    if (inBar % 2 === 1) this.hat(at + beat / 2, 0.014)
  }

  load(spec: SongSpec & { audioFile?: string }) {
    this.spec = spec
    this.totalSteps = spec.chords.length * 4 * 2
    
    // Eğer gerçek audio dosyası varsa onu kullan
    if (spec.audioFile) {
      this.useRealAudio = true
      if (this.audioElement) {
        this.audioElement.pause()
        this.audioElement.src = ''
      }
      this.audioElement = new Audio(spec.audioFile)
      this.audioElement.volume = 0.6
      this.audioElement.loop = true
      
      // Progress tracking
      this.audioElement.addEventListener('timeupdate', () => {
        if (this.audioElement && this.audioElement.duration) {
          const ratio = this.audioElement.currentTime / this.audioElement.duration
          this.onProgress?.(ratio)
        }
      })
      
      this.audioElement.addEventListener('ended', () => {
        this.onEnded?.()
      })
    } else {
      this.useRealAudio = false
    }
  }

  play() {
    // Gerçek audio dosyası varsa onu oynat
    if (this.useRealAudio && this.audioElement) {
      unlockAudio()
      this.audioElement.play().catch(() => {
        // Autoplay policy nedeniyle başarısız olabilir
      })
      return
    }
    
    // Sentezlenmiş müzik
    if (this.timer !== null || !this.spec) return
    unlockAudio()
    const c = audio()
    const bus = this.bus()
    bus.gain.setTargetAtTime(0.5, c.currentTime, 0.3)
    const beat = 60 / this.spec.bpm
    this.t0 = c.currentTime + 0.08
    this.step = 0

    const tick = () => {
      if (!this.spec) return
      const ahead = 0.35
      while (this.t0 < c.currentTime + ahead) {
        this.scheduleStep(this.step, this.t0, beat)
        this.step += 1
        this.t0 += beat / 2
        if (this.step >= this.totalSteps) {
          this.step = 0
        }
      }
      this.onProgress?.(this.step / this.totalSteps)
    }
    tick()
    this.timer = window.setInterval(tick, 90)
  }

  pause() {
    // Gerçek audio dosyası varsa onu duraklat
    if (this.useRealAudio && this.audioElement) {
      this.audioElement.pause()
      return
    }
    
    // Sentezlenmiş müzik
    if (this.timer !== null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
    if (this.out) this.out.gain.setTargetAtTime(0.0001, audio().currentTime, 0.25)
  }

  toggle() {
    if (this.playing) this.pause()
    else this.play()
    return this.playing
  }

  dispose() {
    this.pause()
    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement.src = ''
      this.audioElement = null
    }
    this.out?.disconnect()
    this.out = null
  }
}
