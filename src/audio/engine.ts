import { soundById, type Layer, type Mix, type ChangeFrequency } from '../data';
type AutoValues = { volume: number; frequency: number };
export type LiveValues = Record<string, AutoValues & { updating: boolean }>;
type Channel = {
  gain: GainNode;
  sources: Set<AudioBufferSourceNode>;
  next: number;
  change: number;
  buffer: AudioBuffer;
  config: Layer;
  activityRate: number;
  activityTarget: number;
  activityAt: number;
  activitySilent?: boolean;
  activityUpdateUntil?: number;
  loopTarget?: number;
  loopFadeEnds?: number;
};
const LOOP_AUTO_FADE_SECONDS = 10;
const AUTO_LOOP_AUDIBLE_THRESHOLD = 10;
const canAnchorAutoMode = (layer: Layer) =>
  !layer.muted && layer.max > 0 && soundById.get(layer.soundId)?.kind === 'loop';
const between = (a: number, b: number) => a + Math.random() * (b - a);
const wait = (rate: number) =>
  rate > 0 ? Math.max(0.35, (-Math.log(Math.max(0.00001, Math.random())) * 60) / rate) : Infinity;
const changeInterval = (frequency: ChangeFrequency, evolution: number) => {
  const interval =
    frequency === 'frequent'
      ? between(8, 20)
      : frequency === 'medium'
        ? between(20, 45)
        : between(45, 90);
  return (interval * 35) / Math.max(1, evolution);
};
const boundedRate = (layer: Layer, rate: number) =>
  Math.max(layer.minRate, Math.min(layer.maxRate, rate));
const autoEffectRate = (layer: Layer) =>
  Math.random() * 100 < layer.offChance ? 0 : between(layer.minRate, layer.maxRate);
const startingRate = (layer: Layer, automated: boolean) =>
  automated ? boundedRate(layer, layer.rate) : layer.rate;
export class AmbienceEngine {
  private context?: AudioContext;
  private master?: GainNode;
  private limiter?: DynamicsCompressorNode;
  private worker?: Worker;
  private channels = new Map<string, Channel>();
  private buffers = new Map<string, Promise<AudioBuffer>>();
  private mix?: Mix;
  private pendingAutoValues = new Map<string, AutoValues>();
  private previewPlayback?: { source: AudioBufferSourceNode; gain: GainNode };
  private previewLayerId?: string;
  private previewRevision = 0;
  private revision = 0;
  private running = false;
  onEvent?: (id: string) => void;
  onValues?: (values: LiveValues) => void;
  onPreview?: (id: string | null) => void;
  private init() {
    if (this.context) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.limiter = this.context.createDynamicsCompressor();
    this.limiter.threshold.value = -12;
    this.limiter.knee.value = 10;
    this.limiter.ratio.value = 8;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.25;
    this.master.connect(this.limiter);
    this.limiter.connect(this.context.destination);
    this.worker = new Worker(new URL('./clock.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = () => this.tick();
  }
  async start(mix: Mix) {
    this.init();
    const rev = ++this.revision;
    await this.context!.resume();
    if (rev !== this.revision) return;
    this.running = true;
    try {
      await this.sync(mix);
    } catch (error) {
      this.pause();
      throw error;
    }
  }
  async sync(mix: Mix) {
    if (this.previewLayerId && !mix.layers.some((layer) => layer.id === this.previewLayerId))
      this.stopPreview();
    const previousEvolution = this.mix?.evolution ?? 0;
    const wasAuto = this.mix?.evolveEnabled ?? previousEvolution > 0;
    this.mix = mix;
    this.reconcilePendingValues(mix);
    if (!this.context || !this.running) {
      this.publishPendingValues();
      return;
    }
    const rev = ++this.revision;
    const time = this.context.currentTime;
    this.master!.gain.setTargetAtTime((mix.master / 100) * 0.65, time, 0.12);
    const ids = new Set(mix.layers.map((l) => l.id));
    for (const [id, channel] of this.channels)
      if (!ids.has(id)) {
        this.retire(channel);
        this.channels.delete(id);
      }
    const loaded = await Promise.all(
      mix.layers.map(async (layer) => ({ layer, buffer: await this.load(layer.soundId) })),
    );
    if (rev !== this.revision || !this.running) return;
    for (const { layer, buffer } of loaded) {
      let channel = this.channels.get(layer.id);
      const sound = soundById.get(layer.soundId)!;
      const isNew = !channel;
      if (!channel) {
        const gain = this.context.createGain();
        gain.gain.value = 0;
        gain.connect(this.master!);
        channel = {
          gain,
          sources: new Set(),
          buffer,
          config: layer,
          activityRate: startingRate(layer, mix.evolveEnabled),
          activityTarget: startingRate(layer, mix.evolveEnabled),
          activityAt: this.context.currentTime,
          next: this.context.currentTime + wait(startingRate(layer, mix.evolveEnabled)),
          change: this.context.currentTime + changeInterval(layer.changeFrequency, mix.evolution),
        };
        this.channels.set(layer.id, channel);
        if (sound.kind !== 'effect') {
          const source = this.context.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          source.connect(gain);
          source.start(0, Math.random() * buffer.duration);
          channel.sources.add(source);
        }
      }
      const prev = channel.config;
      channel.config = layer;
      const isAuto = mix.evolveEnabled;
      const autoChanged = isAuto !== wasAuto;
      if (
        autoChanged ||
        layer.changeFrequency !== prev.changeFrequency ||
        mix.evolution !== previousEvolution
      )
        channel.change =
          this.context.currentTime + changeInterval(layer.changeFrequency, mix.evolution);
      if (sound.kind === 'effect') {
        const boundsChanged = layer.minRate !== prev.minRate || layer.maxRate !== prev.maxRate;
        const rateChanged = layer.rate !== prev.rate;
        if (!isAuto || autoChanged || rateChanged) {
          channel.activityUpdateUntil = undefined;
          channel.activitySilent = false;
          channel.activityRate = startingRate(layer, isAuto);
          channel.activityTarget = channel.activityRate;
        } else if (boundsChanged && !channel.activitySilent) {
          channel.activityRate = boundedRate(layer, channel.activityRate);
          channel.activityTarget = boundedRate(layer, channel.activityTarget);
        }
        if (autoChanged || rateChanged || boundsChanged) {
          channel.activityAt = this.context.currentTime;
          channel.next = this.context.currentTime + wait(channel.activityRate);
          channel.change =
            this.context.currentTime + changeInterval(layer.changeFrequency, mix.evolution);
        }
      }
      if (
        isNew ||
        sound.kind === 'effect' ||
        !isAuto ||
        layer.volume !== prev.volume ||
        layer.muted !== prev.muted ||
        autoChanged
      )
        this.level(
          channel,
          layer.muted
            ? 0
            : sound.kind === 'effect'
              ? 100
              : isAuto
                ? Math.max(layer.min, Math.min(layer.max, layer.volume))
                : layer.volume,
          0.3,
        );
      else if (sound.kind === 'loop' && (layer.min !== prev.min || layer.max !== prev.max)) {
        const target = channel.loopTarget ?? channel.gain.gain.value * 100;
        const clamped = target === 0 ? 0 : Math.max(layer.min, Math.min(layer.max, target));
        if (!layer.muted && clamped !== target) this.autoLoopLevel(channel, clamped);
      }
      if (sound.kind === 'loop' && channel.loopFadeEnds)
        channel.change = Math.max(channel.change, channel.loopFadeEnds);
    }
    for (const channel of this.channels.values()) {
      const values = this.pendingAutoValues.get(channel.config.id);
      if (values && !channel.config.muted) {
        this.applyAutoValues(channel, values);
        this.pendingAutoValues.delete(channel.config.id);
      }
    }
    this.keepLoopAudible();
    this.publishValues();
  }
  private reconcilePendingValues(mix: Mix) {
    const layers = new Map(mix.layers.map((layer) => [layer.id, layer]));
    for (const [id, values] of this.pendingAutoValues) {
      const layer = layers.get(id);
      if (!mix.evolveEnabled || !layer) {
        this.pendingAutoValues.delete(id);
        continue;
      }
      const effect = soundById.get(layer.soundId)?.kind === 'effect';
      if (effect && values.frequency !== 0)
        values.frequency = boundedRate(layer, values.frequency / 5) * 5;
      if (!effect && values.volume !== 0)
        values.volume = Math.max(layer.min, Math.min(layer.max, values.volume));
    }
    this.keepPendingLoopAudible(mix);
  }
  private keepPendingLoopAudible(mix: Mix) {
    if (!mix.evolveEnabled || !this.pendingAutoValues.size) return;
    const loops = mix.layers.filter(canAnchorAutoMode);
    if (!loops.length) return;
    const floor = Math.min(
      AUTO_LOOP_AUDIBLE_THRESHOLD,
      Math.max(...loops.map((layer) => layer.max)),
    );
    if (
      loops.some((layer) => {
        const volume =
          this.pendingAutoValues.get(layer.id)?.volume ??
          Math.max(layer.min, Math.min(layer.max, layer.volume));
        return volume >= floor;
      })
    )
      return;
    const candidates = loops.filter((layer) => layer.max >= floor);
    const layer = candidates[Math.floor(Math.random() * candidates.length)];
    this.pendingAutoValues.set(layer.id, {
      volume: layer.max,
      frequency: layer.rate * 5,
    });
  }
  private keepLoopAudible() {
    if (!this.mix?.evolveEnabled || !this.context || !this.running) return;
    const loops = [...this.channels.values()].filter((channel) =>
      canAnchorAutoMode(channel.config),
    );
    if (!loops.length) return;
    const now = this.context.currentTime;
    const floor = Math.min(
      AUTO_LOOP_AUDIBLE_THRESHOLD,
      Math.max(...loops.map((c) => c.config.max)),
    );
    // Keep an audible outgoing loop until another has actually faded up.
    // Normal startup and brief recovery fades are allowed to finish without restarting them.
    if (
      loops.some(
        (c) =>
          (c.loopTarget ?? 0) >= floor &&
          (c.gain.gain.value * 100 >= floor - 0.01 || (c.loopFadeEnds ?? now) <= now + 0.3),
      )
    )
      return;
    const candidates = loops.filter((c) => c.config.max >= floor);
    const channel = candidates.reduce((loudest, c) =>
      c.gain.gain.value > loudest.gain.gain.value ? c : loudest,
    );
    const audible = channel.gain.gain.value * 100 >= floor - 0.01;
    this.autoLoopLevel(channel, channel.config.max, audible ? LOOP_AUTO_FADE_SECONDS : 0.3);
    channel.change = Math.max(channel.change, now + LOOP_AUTO_FADE_SECONDS);
  }
  private publishPendingValues() {
    const values: LiveValues = {};
    for (const [id, value] of this.pendingAutoValues)
      values[id] = {
        volume: Math.round(value.volume * 10) / 10,
        frequency: Math.round(value.frequency * 10) / 10,
        updating: false,
      };
    this.onValues?.(values);
  }
  shuffleAuto(mix: Mix) {
    if (!mix.evolveEnabled) return;
    const values: Record<string, AutoValues> = {};
    this.pendingAutoValues.clear();
    for (const layer of mix.layers) {
      const effect = soundById.get(layer.soundId)?.kind === 'effect';
      values[layer.id] = {
        volume: effect
          ? layer.volume
          : Math.random() * 100 < layer.offChance
            ? 0
            : between(layer.min, layer.max),
        frequency: effect ? autoEffectRate(layer) * 5 : layer.rate * 5,
      };
      this.pendingAutoValues.set(layer.id, values[layer.id]);
    }
    this.keepPendingLoopAudible(mix);
    if (this.running && this.context) {
      for (const [id, channel] of this.channels) {
        const value = this.pendingAutoValues.get(id);
        if (value && !channel.config.muted) {
          this.applyAutoValues(channel, value);
          this.pendingAutoValues.delete(id);
        }
      }
      this.keepLoopAudible();
      this.publishValues();
    } else {
      this.publishPendingValues();
    }
  }
  private applyAutoValues(c: Channel, values: AutoValues) {
    const now = this.context!.currentTime;
    const effect = soundById.get(c.config.soundId)?.kind === 'effect';
    if (effect) {
      const previousRate = c.activityRate;
      c.activitySilent = values.frequency === 0;
      c.activityRate = c.activitySilent ? 0 : boundedRate(c.config, values.frequency / 5);
      if (Math.abs(c.activityRate - previousRate) >= 0.01) c.activityUpdateUntil = now + 1;
      c.activityTarget = c.activityRate;
      c.activityAt = now;
      c.next = now + wait(c.activityRate);
      c.change = now + changeInterval(c.config.changeFrequency, this.mix!.evolution);
    } else {
      // A silence result deliberately sits below the normal minimum volume.
      this.autoLoopLevel(
        c,
        values.volume === 0 ? 0 : Math.max(c.config.min, Math.min(c.config.max, values.volume)),
      );
      c.change =
        now +
        Math.max(
          LOOP_AUTO_FADE_SECONDS,
          changeInterval(c.config.changeFrequency, this.mix!.evolution),
        );
    }
  }
  private publishValues() {
    const values: LiveValues = {};
    const now = this.context!.currentTime;
    for (const [id, c] of this.channels)
      values[id] = {
        volume: Math.round(c.gain.gain.value * 1000) / 10,
        frequency: Math.round(c.activityRate * 50) / 10,
        // Highlight active automation, not the wait between automatic passes.
        updating:
          Boolean(this.mix?.evolveEnabled) &&
          !c.config.muted &&
          (soundById.get(c.config.soundId)?.kind === 'effect'
            ? Math.abs(c.activityTarget - c.activityRate) >= 0.01 ||
              now < (c.activityUpdateUntil ?? 0)
            : now < (c.loopFadeEnds ?? 0) &&
              Math.abs((c.loopTarget ?? 0) / 100 - c.gain.gain.value) >= 0.0005),
      };
    this.onValues?.(values);
  }
  pause() {
    this.stopPreview();
    this.running = false;
    ++this.revision;
    for (const c of this.channels.values()) this.retire(c);
    this.channels.clear();
    this.onValues?.({});
    this.master?.gain.setTargetAtTime(0, this.context!.currentTime, 0.08);
  }
  private retire(c: Channel) {
    const now = this.context!.currentTime;
    this.holdLevel(c, now).setTargetAtTime(0, now, 0.12);
    for (const s of c.sources) {
      try {
        s.stop(now + 0.7);
      } catch {
        /* Already ended. */
      }
    }
    setTimeout(() => c.gain.disconnect(), 800);
  }
  private holdLevel(c: Channel, now: number) {
    const gain = c.gain.gain;
    const current = gain.value;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(current, now);
    return gain;
  }
  private level(c: Channel, volume: number, fade: number) {
    const now = this.context!.currentTime;
    c.loopTarget = volume;
    c.loopFadeEnds = undefined;
    this.holdLevel(c, now).setTargetAtTime(volume / 100, now, fade);
  }
  private autoLoopLevel(c: Channel, volume: number, fade = LOOP_AUTO_FADE_SECONDS) {
    const now = this.context!.currentTime;
    c.loopTarget = volume;
    c.loopFadeEnds = now + fade;
    this.holdLevel(c, now).linearRampToValueAtTime(volume / 100, c.loopFadeEnds);
  }
  private tick() {
    if (!this.running || !this.context || this.context.state !== 'running' || !this.mix) return;
    const now = this.context.currentTime;
    for (const c of this.channels.values()) {
      const l = c.config;
      const effect = soundById.get(l.soundId)!.kind === 'effect';
      if (effect) {
        if (l.muted) {
          c.activityAt = now;
          c.next = now + wait(c.activityRate);
          continue;
        }
        if (this.mix.evolveEnabled && now >= c.change) {
          // Temporary quiet periods stop new events without changing manual mute.
          c.activityTarget = autoEffectRate(l);
          c.activitySilent = c.activityTarget === 0;
          if (c.activitySilent) {
            if (c.activityRate >= 0.01) c.activityUpdateUntil = now + 1;
            c.activityRate = 0;
            c.next = Infinity;
          }
          c.change = now + changeInterval(l.changeFrequency, this.mix.evolution);
        }
        const previousRate = c.activityRate;
        const elapsed = Math.max(0, now - c.activityAt);
        c.activityRate += (c.activityTarget - c.activityRate) * (1 - Math.exp(-elapsed / 8));
        c.activityAt = now;
        // Scale the remaining wait as density drifts; keep its random character.
        if (c.next > now && previousRate > 0 && c.activityRate > 0)
          c.next = now + ((c.next - now) * previousRate) / c.activityRate;
        const rate = c.activityRate;
        if (rate === 0) {
          c.next = Infinity;
          continue;
        }
        if (!Number.isFinite(c.next) || c.next < now) c.next = now + wait(rate);
        if (c.next < now + 0.7) {
          this.voice(c, c.next);
          c.next += wait(rate);
        }
      } else if (!l.muted && this.mix.evolveEnabled && now >= c.change) {
        const low = Math.min(l.min, l.max),
          high = Math.max(l.min, l.max);
        this.autoLoopLevel(c, Math.random() * 100 < l.offChance ? 0 : between(low, high));
        // Let the fixed slow fade finish before choosing another target.
        c.change =
          now +
          Math.max(LOOP_AUTO_FADE_SECONDS, changeInterval(l.changeFrequency, this.mix.evolution));
      }
    }
    this.keepLoopAudible();
    this.publishValues();
  }
  private voice(c: Channel, time: number, preview = false, onEnded?: () => void) {
    const context = this.context!,
      l = c.config;
    if (c.sources.size >= 4) return;
    const source = context.createBufferSource();
    source.buffer = c.buffer;
    source.playbackRate.value = between(1 - l.pitch / 100, 1 + l.pitch / 100);
    const gain = context.createGain();
    gain.gain.value = between(l.effectMin, l.effectMax) / 100;
    source.connect(gain);
    let panner: PannerNode | undefined;
    if (l.spatial) {
      panner = context.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 3;
      panner.rolloffFactor = 0;
      panner.channelCount = 1;
      panner.channelCountMode = 'explicit';
      // Random direction on a fixed sphere; Min/Max volume controls loudness.
      // Sampling vertical position this way avoids clustering at the poles.
      const azimuth = between(0, Math.PI * 2);
      const vertical = between(-1, 1);
      const radius = panner.refDistance;
      const horizontal = Math.sqrt(1 - vertical * vertical) * radius;
      panner.positionX.value = Math.sin(azimuth) * horizontal;
      panner.positionY.value = vertical * radius;
      panner.positionZ.value = -Math.cos(azimuth) * horizontal;
      gain.connect(panner);
      panner.connect(c.gain);
    } else gain.connect(c.gain);
    c.sources.add(source);
    source.onended = () => {
      c.sources.delete(source);
      source.disconnect();
      gain.disconnect();
      panner?.disconnect();
      onEnded?.();
    };
    source.start(time);
    if (!preview)
      setTimeout(
        () => {
          if (this.running && this.channels.get(l.id) === c) this.onEvent?.(l.id);
        },
        Math.max(0, (time - context.currentTime) * 1000),
      );
    return source;
  }
  stopPreview() {
    ++this.previewRevision;
    const playback = this.previewPlayback;
    this.previewPlayback = undefined;
    this.previewLayerId = undefined;
    if (playback && this.context) {
      const now = this.context.currentTime;
      const gain = playback.gain.gain;
      const volume = gain.value;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(volume, now);
      gain.linearRampToValueAtTime(0, now + 0.03);
      playback.source.stop(now + 0.03);
    }
    this.onPreview?.(null);
  }
  async preview(layer: Layer, mix: Mix) {
    this.stopPreview();
    const revision = this.previewRevision;
    this.previewLayerId = layer.id;
    try {
      this.init();
      await this.context!.resume();
      if (revision !== this.previewRevision) return;
      this.master!.gain.setTargetAtTime((mix.master / 100) * 0.65, this.context!.currentTime, 0.1);
      const buffer = await this.load(layer.soundId);
      if (revision !== this.previewRevision) return;
      const gain = this.context!.createGain();
      gain.gain.value = 1;
      gain.connect(this.master!);
      let source: AudioBufferSourceNode;
      const finished = () => {
        source.disconnect();
        gain.disconnect();
        if (this.previewPlayback?.source === source) {
          this.previewPlayback = undefined;
          this.previewLayerId = undefined;
          this.onPreview?.(null);
        }
      };
      if (soundById.get(layer.soundId)?.kind === 'loop') {
        source = this.context!.createBufferSource();
        const now = this.context!.currentTime;
        const volume = layer.volume / 100;
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.03);
        gain.gain.setValueAtTime(volume, now + 9.85);
        gain.gain.linearRampToValueAtTime(0, now + 10);
        source.onended = finished;
        source.start(now);
        source.stop(now + 10);
      } else {
        const channel: Channel = {
          gain,
          buffer,
          config: layer,
          activityRate: layer.rate,
          activityTarget: layer.rate,
          activityAt: this.context!.currentTime,
          sources: new Set(),
          next: Infinity,
          change: Infinity,
        };
        source = this.voice(channel, this.context!.currentTime, true, finished)!;
      }
      this.previewPlayback = { source, gain };
      this.onPreview?.(layer.id);
    } catch (error) {
      if (revision !== this.previewRevision) return;
      this.stopPreview();
      throw error;
    }
  }
  private load(id: string): Promise<AudioBuffer> {
    if (this.buffers.has(id)) return this.buffers.get(id)!;
    const promise = (async () => {
      const sound = soundById.get(id)!;
      const response = await fetch(sound.file);
      if (!response.ok) throw new Error(`Couldn't load ${sound.name}. Please try again.`);
      const decoded = await this.context!.decodeAudioData(await response.arrayBuffer());
      return sound.kind === 'loop' ? this.seamless(decoded) : decoded;
    })();
    this.buffers.set(id, promise);
    promise.catch(() => this.buffers.delete(id));
    return promise;
  }
  private seamless(input: AudioBuffer) {
    const overlap = Math.min(Math.round(input.sampleRate * 0.12), Math.floor(input.length / 4));
    const output = this.context!.createBuffer(
      input.numberOfChannels,
      input.length - overlap,
      input.sampleRate,
    );
    for (let ch = 0; ch < input.numberOfChannels; ch++) {
      const data = input.getChannelData(ch),
        out = output.getChannelData(ch);
      out.set(data.subarray(0, out.length));
      for (let i = 0; i < overlap; i++) {
        const t = i / overlap;
        out[i] = data[out.length + i] * (1 - t) + data[i] * t;
      }
    }
    return output;
  }
  dispose() {
    this.pause();
    this.worker?.terminate();
    void this.context?.close();
  }
}
