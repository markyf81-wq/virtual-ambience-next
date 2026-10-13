import { importedSounds } from './importedSounds';

export type ChangeFrequency = 'slow' | 'medium' | 'frequent';
export type SoundKind = 'loop' | 'effect';
export type SoundCollection = 'nature' | 'urban' | 'space';
export const collections: { id: SoundCollection; name: string; icon: string }[] = [
  { id: 'nature', name: 'Nature', icon: 'leaf' },
  { id: 'urban', name: 'Urban', icon: 'building' },
  { id: 'space', name: 'Space', icon: 'orbit' },
];
export type Sound = {
  id: string;
  name: string;
  collection: SoundCollection;
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
const natureSounds: Sound[] = [
  ...[
    ['Animals_Cicadas', 'Cicadas', 'Wildlife', 'bug'],
    ['Animals_Crickets', 'Crickets', 'Wildlife', 'bug'],
    ['Animals_Crows', 'Crows', 'Wildlife', 'bird'],
    ['Animals_Frogs', 'Frog chorus', 'Wildlife', 'frog'],
    ['Animals_Forest-Birds', 'Forest birdsong', 'Birds', 'bird'],
    ['Animals_Jungle-Night', 'Malaysian jungle at night', 'Wildlife', 'leaf'],
    ['Animals_Night-Bird', 'Night birds', 'Wildlife', 'bird'],
    ['Civilization_Music', 'Distant music', 'Other', 'music'],
    ['Fire_Fireplace', 'Crackling fire', 'Fire', 'fire'],
    ['Music_Gongs', 'Layered gongs', 'Other', 'music'],
    ['Nature_Rain-Heavy', 'Heavy rain', 'Weather', 'rain'],
    ['Nature_Rain-Light', 'Gentle rain', 'Weather', 'rain'],
    ['Nature_Rain-Leaves', 'Rain on leaves', 'Weather', 'rain'],
    ['Nature_River', 'Flowing river', 'Water', 'water'],
    ['Nature_Thunder', 'Rolling thunder', 'Weather', 'storm'],
    ['Nature_Wind', 'Wind in the trees', 'Weather', 'wind'],
  ].map(([id, name, category, icon]) => ({
    id,
    name,
    category,
    icon,
    collection: 'nature' as const,
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
    collection: 'nature' as const,
    kind: 'effect' as const,
    file: `/audio/fx/${id}.mp3`,
  })),
];
export const sounds: Sound[] = [...natureSounds, ...importedSounds].map((sound) => ({
  ...sound,
  file: `${import.meta.env.BASE_URL}${sound.file.slice(1)}`,
}));
export const MAX_LAYERS = 64;
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
type SceneLayer = [
  soundId: string,
  volume: number,
  settings?: Partial<Omit<Layer, 'id' | 'soundId' | 'volume'>>,
];
type Scene = {
  id: string;
  name: string;
  collection: SoundCollection;
  eyebrow: string;
  description: string;
  tag: string;
  layers: SceneLayer[];
  allSounds?: boolean;
};

// Preset frequencies use the same percentages shown by the controls.
const loopPreset = (
  soundId: string,
  volume: number,
  min: number,
  max: number,
  offChance = 8,
): SceneLayer => [soundId, volume, { min, max, offChance }];
const effectPreset = (
  soundId: string,
  maxVolume: number,
  frequency: number,
  maxFrequency: number,
  offChance = 12,
  pitch = 5,
): SceneLayer => [
  soundId,
  maxVolume,
  {
    effectMin: Math.round(maxVolume * 0.25),
    effectMax: maxVolume,
    rate: frequency / 5,
    minRate: 0,
    maxRate: maxFrequency / 5,
    offChance,
    pitch,
  },
];

// Mark's saved “Best” mix: nine loops and eight effects, copied without changing its settings.
const forestStormLayers: SceneLayer[] = [
  loopPreset('Nature_Wind', 14, 5, 24, 12),
  loopPreset('Animals_Forest-Birds', 18, 10, 26, 8),
  [
    'Bird_Woodpecker',
    38,
    { effectMin: 10, effectMax: 38, rate: 1.6, minRate: 0, maxRate: 3.2, offChance: 12, pitch: 5 },
  ],
  [
    'Animal_Chipmunk',
    28,
    { effectMin: 7, effectMax: 28, rate: 1, minRate: 0, maxRate: 2, offChance: 18, pitch: 5 },
  ],
  [
    'Bird_Sparrow',
    26,
    { effectMin: 7, effectMax: 26, rate: 1, minRate: 0, maxRate: 2, offChance: 12, pitch: 5 },
  ],
  loopPreset('Animals_Crickets', 30, 9, 45, 8),
  loopPreset('Animals_Cicadas', 30, 15, 45, 8),
  loopPreset('Animals_Frogs', 30, 15, 45, 8),
  loopPreset('Nature_Rain-Light', 30, 9, 45, 8),
  loopPreset('Nature_Rain-Heavy', 30, 15, 45, 8),
  loopPreset('Nature_Rain-Leaves', 30, 15, 45, 8),
  loopPreset('Nature_Thunder', 30, 15, 45, 8),
  [
    'Bug_Katydid',
    40,
    { effectMin: 28, effectMax: 40, rate: 3, minRate: 1.5, maxRate: 4.5, offChance: 8, pitch: 8 },
  ],
  [
    'Bug_Ticky',
    40,
    { effectMin: 28, effectMax: 40, rate: 3, minRate: 1.5, maxRate: 4.5, offChance: 8, pitch: 8 },
  ],
  [
    'Thunder_Crack',
    40,
    { effectMin: 3, effectMax: 40, rate: 3, minRate: 0, maxRate: 1.8, offChance: 8, pitch: 2 },
  ],
  [
    'Thunder_Far',
    40,
    { effectMin: 5, effectMax: 40, rate: 3, minRate: 0, maxRate: 2.3, offChance: 8, pitch: 3 },
  ],
  [
    'Thunder_Loud',
    40,
    { effectMin: 3, effectMax: 28, rate: 3, minRate: 0, maxRate: 2.2, offChance: 8, pitch: 2 },
  ],
];

const natureScenes: Omit<Scene, 'collection'>[] = [
  {
    id: 'forest',
    name: 'Forest day',
    eyebrow: 'LIFE THROUGH THE CANOPY',
    description:
      'A river, wind, birds and summer insects build a woodland that changes around you.',
    tag: 'Living woodland',
    layers: [
      loopPreset('Nature_River', 30, 18, 42, 0),
      loopPreset('Nature_Wind', 16, 5, 26, 8),
      loopPreset('Animals_Forest-Birds', 28, 12, 38, 8),
      loopPreset('Animals_Crows', 12, 0, 20, 35),
      loopPreset('Animals_Cicadas', 20, 5, 32, 20),
      effectPreset('Bird_Woodpecker', 34, 5, 12, 15),
      effectPreset('Animal_Chipmunk', 26, 3, 8, 20),
      effectPreset('Bird_Sparrow', 26, 5, 12, 12),
      effectPreset('Bird_Crow', 30, 3, 8, 20, 3),
      effectPreset('Bird_Eagle', 28, 1, 4, 35, 3),
      effectPreset('Bird_Fly-Away', 24, 3, 7, 25),
      effectPreset('Bird_Wing-Flap', 20, 4, 9, 20),
      effectPreset('Bird_Squark', 28, 2, 6, 25, 3),
      effectPreset('Bug_Katydid', 20, 5, 12, 18),
      effectPreset('Bug_Ticky', 16, 5, 12, 18),
    ],
  },
  {
    id: 'storm',
    name: 'Forest storm',
    eyebrow: 'A FOREST FULL OF WEATHER',
    description: 'Birds, frogs and insects surround layered rain, wind and rolling thunder.',
    tag: 'Rain & wildlife',
    layers: forestStormLayers,
  },
  {
    id: 'night',
    name: 'Night wetlands',
    eyebrow: 'AFTER THE SUN GOES DOWN',
    description:
      'Crickets, frogs and night birds gather beside the river, with owls and distant calls.',
    tag: 'Moonlit water',
    layers: [
      loopPreset('Animals_Crickets', 28, 15, 40, 8),
      loopPreset('Animals_Frogs', 28, 12, 40, 8),
      loopPreset('Animals_Night-Bird', 18, 5, 28, 18),
      loopPreset('Nature_River', 20, 10, 30, 0),
      loopPreset('Nature_Wind', 12, 0, 22, 20),
      loopPreset('Animals_Cicadas', 10, 0, 18, 40),
      effectPreset('Animal_Frog_Hoot', 32, 5, 12, 12, 3),
      effectPreset('Animal_Frog_Ribbit', 28, 8, 18, 10, 4),
      effectPreset('Bird_Loon', 32, 2, 6, 25, 3),
      effectPreset('Bird_Owl', 30, 2, 6, 25, 3),
      effectPreset('Bug_Katydid', 22, 5, 12, 15),
      effectPreset('Bug_Ticky', 18, 6, 14, 15),
      effectPreset('Bird_Crow', 18, 1, 3, 45, 3),
    ],
  },
  {
    id: 'jungle',
    name: 'Jungle rain',
    eyebrow: 'ALIVE UNDER THE LEAVES',
    description: 'A Malaysian jungle chorus, leaf rain and soft wind carry frogs and insect calls.',
    tag: 'Tropical forest',
    layers: [
      loopPreset('Animals_Jungle-Night', 36, 22, 48, 0),
      loopPreset('Nature_Rain-Leaves', 24, 10, 36, 10),
      loopPreset('Nature_Rain-Light', 18, 0, 28, 25),
      loopPreset('Nature_Wind', 12, 0, 20, 25),
      loopPreset('Animals_Frogs', 16, 0, 26, 25),
      loopPreset('Animals_Crickets', 12, 0, 22, 30),
      effectPreset('Animal_Frog_Hoot', 26, 3, 8, 20, 3),
      effectPreset('Animal_Frog_Ribbit', 24, 4, 10, 20, 4),
      effectPreset('Bug_Katydid', 20, 5, 12, 15),
      effectPreset('Bug_Ticky', 18, 5, 12, 15),
      effectPreset('Bird_Loon', 22, 1, 4, 35, 3),
    ],
  },
  {
    id: 'campsite',
    name: 'Forest retreat',
    eyebrow: 'A QUIET PLACE TO STAY',
    description:
      'A fire beside a stream, evening wildlife and occasional distant music or resonant gongs.',
    tag: 'Fire & reflection',
    layers: [
      loopPreset('Fire_Fireplace', 32, 20, 44, 0),
      loopPreset('Nature_River', 18, 5, 28, 15),
      loopPreset('Nature_Wind', 10, 0, 18, 25),
      loopPreset('Animals_Crickets', 20, 8, 30, 15),
      loopPreset('Animals_Forest-Birds', 10, 0, 18, 40),
      loopPreset('Civilization_Music', 12, 0, 20, 60),
      loopPreset('Music_Gongs', 16, 0, 24, 55),
      effectPreset('Bird_Owl', 24, 2, 5, 25, 3),
      effectPreset('Bird_Sparrow', 20, 2, 6, 30),
      effectPreset('Bird_Fly-Away', 18, 2, 5, 35),
      effectPreset('Bug_Katydid', 18, 4, 10, 20),
    ],
  },
  {
    id: 'all',
    name: 'All Nature sounds',
    eyebrow: 'THE COMPLETE COLLECTION',
    description:
      'Every Nature recording in one mix. An open playground for building your own scene.',
    tag: 'Explore',
    allSounds: true,
    layers: natureSounds.map((sound): SceneLayer => [sound.id, sound.kind === 'loop' ? 12 : 20]),
  },
];
const urbanScenes: Omit<Scene, 'collection'>[] = [
  {
    id: 'city-morning',
    name: 'City life',
    eyebrow: 'A NEIGHBOURHOOD IN MOTION',
    description: 'Birds, market chatter, traffic and work vehicles weave through the city hum.',
    tag: 'Streets & activity',
    layers: [
      loopPreset('Urban_City-Hum', 24, 14, 34, 0),
      loopPreset('Urban_Street', 22, 8, 32, 10),
      loopPreset('Urban_Market', 18, 0, 28, 30),
      loopPreset('Urban_Birds-City', 20, 5, 30, 20),
      loopPreset('Urban_Pigeons', 12, 0, 20, 35),
      loopPreset('Urban_Highway', 12, 0, 22, 30),
      loopPreset('Urban_Construction', 14, 0, 24, 45),
      loopPreset('Urban_Garbage-Truck', 10, 0, 20, 55),
      loopPreset('Urban_Fire-Truck', 8, 0, 16, 70),
      effectPreset('Urban_Bird-Tweet', 24, 4, 10, 15, 3),
      effectPreset('Urban_Bells', 24, 2, 5, 30, 0),
      effectPreset('Urban_Horn', 26, 3, 7, 25, 2),
    ],
  },
  {
    id: 'rainy-city',
    name: 'Rainy city',
    eyebrow: 'WEATHER ON THE STREETS',
    description:
      'Wet-road traffic, rain and wind surround a city still busy with birds, voices and bells.',
    tag: 'Rain & traffic',
    layers: [
      loopPreset('Urban_Wet-Road', 30, 18, 42, 0),
      loopPreset('Nature_Rain-Light', 24, 10, 36, 8),
      loopPreset('Nature_Rain-Heavy', 12, 0, 24, 35),
      loopPreset('Nature_Wind', 10, 0, 20, 25),
      loopPreset('Urban_Highway', 18, 5, 28, 15),
      loopPreset('Urban_City-Hum', 16, 5, 26, 10),
      loopPreset('Urban_Street', 12, 0, 22, 30),
      loopPreset('Urban_Market', 10, 0, 18, 50),
      loopPreset('Urban_Birds-City', 10, 0, 18, 45),
      effectPreset('Urban_Horn', 24, 2, 6, 25, 2),
      effectPreset('Urban_Bells', 22, 1, 4, 35, 0),
      effectPreset('Urban_Bird-Tweet', 18, 2, 5, 30, 3),
      effectPreset('Thunder_Far', 20, 1, 4, 45, 3),
    ],
  },
  {
    id: 'all-urban',
    name: 'All Urban sounds',
    eyebrow: 'THE CITY COLLECTION',
    description: 'Every Urban loop and effect, ready to shape into your own city soundscape.',
    tag: 'Explore',
    allSounds: true,
    layers: importedSounds
      .filter((sound) => sound.collection === 'urban')
      .map((sound): SceneLayer => [sound.id, sound.kind === 'loop' ? 12 : 20]),
  },
];

const spaceScenes: Omit<Scene, 'collection'>[] = [
  {
    id: 'starship-cruise',
    name: 'Starship voyage',
    eyebrow: 'LIFE AMONG THE STARS',
    description:
      'Engines, station systems and machinery surround cosmic wind, passing galaxies and signals.',
    tag: 'Ship & station',
    layers: [
      loopPreset('Space_Engine', 28, 18, 40, 0),
      loopPreset('Space_Station', 22, 8, 32, 10),
      loopPreset('Space_Machines-Hum', 16, 5, 26, 15),
      loopPreset('Space_Hiss', 10, 0, 18, 25),
      loopPreset('Space_Wind', 16, 5, 26, 15),
      loopPreset('Space_Galaxy-Flyby', 12, 0, 22, 35),
      loopPreset('Space_Galaxy-Flyby-2', 10, 0, 20, 40),
      loopPreset('Space_Solar', 10, 0, 18, 40),
      loopPreset('Space_Flare', 8, 0, 16, 50),
      effectPreset('Space_Pulsar', 20, 3, 8, 20, 0),
      effectPreset('Space_Laser', 18, 2, 6, 35, 0),
    ],
  },
  {
    id: 'event-horizon',
    name: 'Deep space',
    eyebrow: 'AT THE EDGE OF THE UNKNOWN',
    description:
      'A black-hole drone and alien resonance shift through radiation, solar textures and distant signals.',
    tag: 'Cosmic & alien',
    layers: [
      loopPreset('Space_Black-Hole', 30, 20, 42, 0),
      loopPreset('Space_UFO', 20, 5, 32, 20),
      loopPreset('Space_Radiation', 16, 0, 26, 25),
      loopPreset('Space_Wind', 14, 5, 24, 15),
      loopPreset('Space_Flare', 10, 0, 20, 40),
      loopPreset('Space_Solar', 10, 0, 18, 40),
      loopPreset('Space_Galaxy-Flyby', 10, 0, 20, 35),
      loopPreset('Space_Galaxy-Flyby-2', 12, 0, 22, 35),
      loopPreset('Space_Hiss', 6, 0, 12, 55),
      effectPreset('Space_Pulsar', 24, 4, 10, 20, 0),
      effectPreset('Space_Laser', 20, 3, 8, 30, 0),
    ],
  },
  {
    id: 'all-space',
    name: 'All Space sounds',
    eyebrow: 'THE SPACE COLLECTION',
    description: 'Every Space loop and effect, ready to build your own world beyond Earth.',
    tag: 'Explore',
    allSounds: true,
    layers: importedSounds
      .filter((sound) => sound.collection === 'space')
      .map((sound): SceneLayer => [sound.id, sound.kind === 'loop' ? 12 : 20]),
  },
];

export const scenes: Scene[] = [
  ...natureScenes.map((scene): Scene => ({ ...scene, collection: 'nature' })),
  ...urbanScenes.map((scene): Scene => ({ ...scene, collection: 'urban' })),
  ...spaceScenes.map((scene): Scene => ({ ...scene, collection: 'space' })),
];

// Old saved mixes keep their sound settings and use the closest consolidated scene.
const sceneAliases: Record<string, string> = {
  dusk: 'night',
  morning: 'forest',
  downpour: 'storm',
  summer: 'forest',
  wetland: 'night',
  ridge: 'forest',
  sanctuary: 'campsite',
  'market-day': 'city-morning',
  'working-city': 'city-morning',
  'orbital-station': 'starship-cruise',
  'alien-signal': 'event-horizon',
};
function resolveSceneId(id: unknown): string {
  if (typeof id !== 'string') return 'forest';
  const resolved = sceneAliases[id] ?? id;
  return scenes.some((scene) => scene.id === resolved) ? resolved : 'forest';
}

export function sceneMix(id: string): Mix {
  const scene = scenes.find((s) => s.id === resolveSceneId(id)) ?? scenes[0];
  const layers = scene.layers.map(([sound, volume, settings]) => {
    const layer = { ...makeLayer(sound, volume), ...settings };
    if (scene.allSounds && soundById.get(layer.soundId)?.kind === 'effect') {
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
    if (scene.allSounds && soundById.get(layer.soundId)?.kind === 'loop') {
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
    sceneId: resolveSceneId(m.sceneId),
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
