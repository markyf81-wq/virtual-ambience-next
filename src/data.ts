export type ChangeFrequency = 'slow' | 'medium' | 'frequent';
export type SoundKind = 'loop' | 'effect';
export type Sound = {
  id: string;
  name: string;
  category: string;
  kind: SoundKind;
  file: string;
  icon: string;
};
export type Layer = {
  id: string;
  soundId: string;
  volume: number;
  effectMin: number;
  effectMax: number;
  muted: boolean;
  min: number;
  max: number;
  offChance: number;
  changeFrequency: ChangeFrequency;
  rate: number;
  minRate: number;
  maxRate: number;
  pitch: number;
  spatial: boolean;
};
export type Mix = {
  sceneId: string;
  name: string;
  layers: Layer[];
  master: number;
  evolution: number;
  evolveEnabled: boolean;
};
export const sounds: Sound[] = [
  ...[
    ['Animals_Cicadas', 'Cicadas', 'Wildlife', 'bug'],
    ['Animals_Crickets', 'Crickets', 'Wildlife', 'bug'],
    ['Animals_Crows', 'Crows', 'Wildlife', 'bird'],
    ['Animals_Frogs', 'Frog chorus', 'Wildlife', 'frog'],
    ['Animals_Night-Bird', 'Night birds', 'Wildlife', 'bird'],
    ['Civilization_Music', 'Distant music', 'Other', 'music'],
    ['Nature_Rain-Heavy', 'Heavy rain', 'Weather', 'rain'],
    ['Nature_Rain-Light', 'Gentle rain', 'Weather', 'rain'],
    ['Nature_River', 'Flowing river', 'Water', 'water'],
    ['Nature_Thunder', 'Rolling thunder', 'Weather', 'storm'],
    ['Nature_Wind', 'Wind in the trees', 'Weather', 'wind'],
  ].map(([id, name, category, icon]) => ({
    id,
    name,
    category,
    icon,
    kind: 'loop' as const,
    file: `/audio/loops/${id}.mp3`,
  })),
  ...[
    ['Animal_Chipmunk', 'Chipmunk', 'Wildlife', 'frog'],
    ['Animal_Frog_Hoot', 'Frog hoot', 'Wildlife', 'frog'],
    ['Animal_Frog_Ribbit', 'Frog ribbit', 'Wildlife', 'frog'],
    ['Bird_Crow', 'Crow call', 'Birds', 'bird'],
    ['Bird_Eagle', 'Eagle', 'Birds', 'bird'],
    ['Bird_Fly-Away', 'Bird taking flight', 'Birds', 'bird'],
    ['Bird_Loon', 'Loon', 'Birds', 'bird'],
    ['Bird_Owl', 'Owl', 'Birds', 'bird'],
    ['Bird_Sparrow', 'Sparrow', 'Birds', 'bird'],
    ['Bird_Squark', 'Bird squawk', 'Birds', 'bird'],
    ['Bird_Wing-Flap', 'Wing flaps', 'Birds', 'bird'],
    ['Bird_Woodpecker', 'Woodpecker', 'Birds', 'bird'],
    ['Bug_Katydid', 'Katydid', 'Wildlife', 'bug'],
    ['Bug_Ticky', 'Insect clicks', 'Wildlife', 'bug'],
    ['Thunder_Crack', 'Thunder crack', 'Weather', 'storm'],
    ['Thunder_Far', 'Distant thunder', 'Weather', 'storm'],
    ['Thunder_Loud', 'Loud thunder', 'Weather', 'storm'],
  ].map(([id, name, category, icon]) => ({
    id,
    name,
    category,
    icon,
    kind: 'effect' as const,
    file: `/audio/fx/${id}.mp3`,
  })),
];
export const MAX_LAYERS = 32;
export const soundById = new Map(sounds.map((sound) => [sound.id, sound]));
export function makeLayer(soundId: string, volume = 45): Layer {
  return {
    id: crypto.randomUUID(),
    soundId,
    volume,
    effectMin: Math.round(volume * 0.7),
    effectMax: volume,
    muted: false,
    min: Math.max(5, volume - 15),
    max: Math.min(90, volume + 15),
    offChance: 8,
    changeFrequency: 'slow',
    rate: 3,
    minRate: 1.5,
    maxRate: 4.5,
    pitch: 8,
    spatial: soundById.get(soundId)?.kind === 'effect',
  };
}
export const scenes = [
  {
    id: 'forest',
    name: 'Forest dreams',
    eyebrow: 'A QUIET PLACE TO BEGIN',
    description: 'A river below. A canopy above. Nothing to hurry for.',
    tag: 'Grounding',
    layers: [
      ['Nature_River', 38],
      ['Nature_Wind', 22],
      ['Animals_Crickets', 22],
      ['Bird_Sparrow', 42],
      ['Bird_Woodpecker', 35],
    ],
  },
  {
    id: 'storm',
    name: 'Distant storm',
    eyebrow: 'LET THE WORLD WASH AWAY',
    description: 'Soft rain, restless trees, and thunder on the horizon.',
    tag: 'Focus',
    layers: [
      ['Nature_Rain-Light', 55],
      ['Nature_Wind', 25],
      ['Thunder_Far', 45],
      ['Thunder_Crack', 30],
    ],
  },
  {
    id: 'dusk',
    name: 'Last light',
    eyebrow: 'THE DAY SLOWS DOWN',
    description: 'Golden light fades. The evening chorus takes its place.',
    tag: 'Unwind',
    layers: [
      ['Animals_Cicadas', 25],
      ['Animals_Crickets', 35],
      ['Nature_Wind', 20],
      ['Bird_Loon', 35],
      ['Animal_Frog_Ribbit', 30],
    ],
  },
  {
    id: 'morning',
    name: 'First light',
    eyebrow: 'A FRESH START',
    description: 'Birdsong drifts through the trees as the forest wakes.',
    tag: 'Restore',
    layers: [
      ['Nature_River', 25],
      ['Nature_Wind', 22],
      ['Bird_Sparrow', 48],
      ['Bird_Eagle', 30],
      ['Bird_Wing-Flap', 30],
    ],
  },
  {
    id: 'night',
    name: 'After dark',
    eyebrow: 'SETTLE INTO THE STILLNESS',
    description: 'Crickets, a distant owl, and the gentle rhythm of night.',
    tag: 'Rest',
    layers: [
      ['Animals_Crickets', 38],
      ['Animals_Frogs', 22],
      ['Nature_Wind', 15],
      ['Bird_Owl', 36],
    ],
  },
  {
    id: 'downpour',
    name: 'Rain shelter',
    eyebrow: 'NOWHERE ELSE TO BE',
    description: 'An enveloping downpour. A small shelter from the day.',
    tag: 'Deep focus',
    layers: [
      ['Nature_Rain-Heavy', 55],
      ['Nature_Thunder', 18],
      ['Thunder_Far', 35],
    ],
  },
  {
    id: 'all',
    name: 'All sounds',
    eyebrow: 'THE COMPLETE COLLECTION',
    description: 'Every loop and sound effect, ready to explore and adjust.',
    tag: 'Explore',
    layers: sounds.map((sound) => [sound.id, sound.kind === 'loop' ? 12 : 20]),
  },
];
export function sceneMix(id: string): Mix {
  const scene = scenes.find((s) => s.id === id) ?? scenes[0];
  const layers = scene.layers.map(([sound, volume]) => {
    const layer = makeLayer(String(sound), Number(volume));
    if (scene.id === 'all' && soundById.get(layer.soundId)?.kind === 'effect') {
      return {
        ...layer,
        effectMin: 0,
        effectMax: 60,
        pitch: 5,
        rate: 1,
        minRate: 0,
        maxRate: 2,
        offChance: 8,
      };
    }
    if (scene.id === 'all' && soundById.get(layer.soundId)?.kind === 'loop') {
      return { ...layer, min: 5, max: 50 };
    }
    return layer;
  });
  return {
    sceneId: scene.id,
    name: scene.name,
    layers,
    master: 65,
    evolution: 35,
    evolveEnabled: true,
  };
}
export function parseMix(value: unknown): Mix | null {
  if (!value || typeof value !== 'object') return null;
  const m = value as Record<string, unknown>;
  if (!Array.isArray(m.layers) || m.layers.length > MAX_LAYERS) return null;
  const num = (v: unknown, d: number, a: number, b: number) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.max(a, Math.min(b, v)) : d;
  const layers: Layer[] = [];
  for (const item of m.layers) {
    if (!item || typeof item !== 'object' || !soundById.has(item.soundId)) return null;
    const l = makeLayer(item.soundId);
    const volume = num(item.volume, 45, 0, 100);
    const effectMin = num(item.effectMin, Math.round(volume * 0.7), 0, 100);
    const effectMax = num(item.effectMax, volume, 0, 100);
    const rate = num(item.rate, 3, 0, 20);
    const minRate = num(item.minRate, Math.max(0.5, rate * 0.5), 0, 20);
    const maxRate = num(item.maxRate, Math.max(0.5, Math.min(20, rate * 1.5)), 0, 20);
    const min = num(item.min, 20, 0, 100);
    const max = num(item.max, 65, 0, 100);
    layers.push({
      ...l,
      volume,
      effectMin: Math.min(effectMin, effectMax),
      effectMax: Math.max(effectMin, effectMax),
      muted: item.muted === true,
      min: Math.min(min, max),
      max: Math.max(min, max),
      offChance: num(item.offChance, 8, 0, 100),
      changeFrequency: ['slow', 'medium', 'frequent'].includes(item.changeFrequency)
        ? item.changeFrequency
        : num(item.evolution, 35, 0, 100) < 40
          ? 'slow'
          : num(item.evolution, 35, 0, 100) < 75
            ? 'medium'
            : 'frequent',
      rate,
      minRate: Math.min(minRate, maxRate),
      maxRate: Math.max(minRate, maxRate),
      pitch: num(item.pitch, 8, 0, 30),
      spatial:
        soundById.get(item.soundId)?.kind === 'effect' &&
        (typeof item.spatial === 'boolean' ? item.spatial : m.spatial !== false),
    });
  }
  return {
    sceneId:
      typeof m.sceneId === 'string' && scenes.some((s) => s.id === m.sceneId)
        ? m.sceneId
        : 'forest',
    name: typeof m.name === 'string' ? m.name.slice(0, 60) : 'My soundscape',
    layers,
    master: num(m.master, 65, 0, 100),
    evolution: Math.max(1, num(m.evolution, 35, 0, 100) || 35),
    evolveEnabled:
      typeof m.evolveEnabled === 'boolean'
        ? m.evolveEnabled
        : m.autoMode !== false && num(m.evolution, 35, 0, 100) > 0,
  };
}
