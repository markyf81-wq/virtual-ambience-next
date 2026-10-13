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
export const sounds: Sound[] = [...natureSounds, ...importedSounds];
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

const natureScenes: Omit<Scene, 'collection'>[] = [
  {
    id: 'forest',
    name: 'Forest dreams',
    eyebrow: 'FOLLOW THE STREAM',
    description: 'A flowing stream, soft birdsong, and woodpecker taps beneath the canopy.',
    tag: 'Woodland',
    layers: [
      loopPreset('Nature_River', 42, 30, 55, 0),
      loopPreset('Nature_Wind', 14, 5, 24, 12),
      loopPreset('Animals_Forest-Birds', 18, 10, 26, 8),
      effectPreset('Bird_Woodpecker', 38, 8, 16),
      effectPreset('Animal_Chipmunk', 28, 5, 10, 18),
      effectPreset('Bird_Sparrow', 26, 5, 10),
    ],
  },
  {
    id: 'storm',
    name: 'Distant storm',
    eyebrow: 'THUNDER ON THE HORIZON',
    description: 'Rain builds through the trees while cicadas linger and thunder rolls in.',
    tag: 'Approaching rain',
    layers: [
      loopPreset('Nature_Rain-Light', 55, 15, 70),
      loopPreset('Nature_Wind', 25, 5, 50),
      effectPreset('Thunder_Far', 45, 5, 10, 8, 3),
      effectPreset('Thunder_Crack', 30, 2, 5, 20, 3),
      loopPreset('Nature_Rain-Heavy', 30, 5, 45),
      loopPreset('Animals_Cicadas', 30, 8, 46),
    ],
  },
  {
    id: 'dusk',
    name: 'Last light',
    eyebrow: 'EVENING BY THE WATER',
    description: 'A loon calls across the river as crickets take over from the daytime chorus.',
    tag: 'Sunset',
    layers: [
      loopPreset('Nature_River', 22, 15, 32, 0),
      loopPreset('Animals_Crickets', 34, 18, 46, 5),
      loopPreset('Animals_Cicadas', 12, 0, 22, 25),
      effectPreset('Bird_Loon', 40, 4, 8, 20, 3),
      effectPreset('Animal_Frog_Ribbit', 24, 6, 12),
      effectPreset('Bug_Katydid', 22, 7, 14),
    ],
  },
  {
    id: 'morning',
    name: 'First light',
    eyebrow: 'THE WOODS WAKE UP',
    description:
      'A morning chorus fills the forest, with scattered crow calls and fluttering wings.',
    tag: 'Dawn chorus',
    layers: [
      loopPreset('Animals_Forest-Birds', 32, 20, 44, 0),
      loopPreset('Animals_Crows', 12, 5, 20, 15),
      loopPreset('Nature_Wind', 12, 5, 22, 5),
      effectPreset('Bird_Sparrow', 30, 8, 16, 8),
      effectPreset('Bird_Crow', 32, 5, 10, 18, 3),
      effectPreset('Bird_Fly-Away', 26, 4, 8, 20),
      effectPreset('Bird_Wing-Flap', 22, 6, 12, 18),
    ],
  },
  {
    id: 'night',
    name: 'After dark',
    eyebrow: 'BENEATH A QUIET SKY',
    description: 'Night birds and a lone owl break the steady hush of crickets.',
    tag: 'Moonlit woods',
    layers: [
      loopPreset('Animals_Crickets', 32, 20, 42, 0),
      loopPreset('Animals_Night-Bird', 18, 5, 28, 15),
      loopPreset('Nature_Wind', 10, 0, 18, 20),
      effectPreset('Bird_Owl', 34, 3, 7, 20, 3),
      effectPreset('Bug_Ticky', 16, 5, 10, 18),
    ],
  },
  {
    id: 'downpour',
    name: 'Downpour',
    eyebrow: 'IN THE HEART OF THE STORM',
    description: 'Heavy rain surrounds you, with low rolling thunder and occasional sharp cracks.',
    tag: 'Wild weather',
    layers: [
      loopPreset('Nature_Rain-Heavy', 52, 40, 65, 0),
      loopPreset('Nature_Rain-Leaves', 20, 10, 28, 10),
      loopPreset('Nature_Thunder', 22, 10, 34, 12),
      loopPreset('Nature_Wind', 18, 5, 30, 15),
      effectPreset('Thunder_Loud', 48, 3, 7, 18, 2),
      effectPreset('Thunder_Crack', 40, 2, 5, 25, 2),
      effectPreset('Thunder_Far', 32, 5, 10, 12, 3),
    ],
  },
  {
    id: 'summer',
    name: 'Summer afternoon',
    eyebrow: 'HEAT IN THE TREETOPS',
    description: 'Cicadas hum in the warm air, punctuated by katydids and wandering birds.',
    tag: 'Summer',
    layers: [
      loopPreset('Animals_Cicadas', 40, 28, 52, 0),
      loopPreset('Nature_Wind', 12, 0, 20, 25),
      effectPreset('Bug_Katydid', 28, 10, 18, 8),
      effectPreset('Bug_Ticky', 22, 12, 20, 8),
      effectPreset('Bird_Squark', 34, 4, 8, 20, 3),
      effectPreset('Animal_Chipmunk', 24, 3, 7, 20),
    ],
  },
  {
    id: 'wetland',
    name: 'Frog hollow',
    eyebrow: 'AT THE WATER’S EDGE',
    description: 'A chorus of frogs gathers beside slow water, with low hoots and a distant loon.',
    tag: 'Wetland',
    layers: [
      loopPreset('Animals_Frogs', 38, 24, 50, 0),
      loopPreset('Nature_River', 18, 10, 26, 0),
      loopPreset('Animals_Crickets', 14, 5, 22, 15),
      effectPreset('Animal_Frog_Hoot', 38, 7, 14, 8, 3),
      effectPreset('Animal_Frog_Ribbit', 32, 12, 22, 8, 4),
      effectPreset('Bird_Loon', 28, 2, 5, 25, 3),
    ],
  },
  {
    id: 'ridge',
    name: 'High country',
    eyebrow: 'ROOM TO BREATHE',
    description: 'Open wind, an eagle overhead, and scattered calls from the ridge.',
    tag: 'Mountain air',
    layers: [
      loopPreset('Nature_Wind', 40, 25, 55, 0),
      loopPreset('Animals_Crows', 10, 0, 18, 25),
      effectPreset('Bird_Eagle', 40, 3, 7, 20, 3),
      effectPreset('Bird_Crow', 26, 3, 6, 25, 3),
      effectPreset('Bird_Fly-Away', 24, 2, 5, 25),
      effectPreset('Bird_Wing-Flap', 20, 3, 7, 20),
    ],
  },
  {
    id: 'campsite',
    name: 'Campsite evening',
    eyebrow: 'A LITTLE COMPANY IN THE WOODS',
    description:
      'A crackling fire, crickets, and faint music from a nearby camp in the evening air.',
    tag: 'Distant company',
    layers: [
      loopPreset('Fire_Fireplace', 38, 25, 50, 0),
      loopPreset('Civilization_Music', 18, 5, 26, 18),
      loopPreset('Animals_Crickets', 26, 15, 38, 0),
      loopPreset('Nature_Wind', 10, 0, 18, 20),
      effectPreset('Bird_Owl', 24, 2, 5, 25, 3),
      effectPreset('Bug_Katydid', 18, 5, 10, 15),
    ],
  },
  {
    id: 'jungle',
    name: 'Jungle night',
    eyebrow: 'ALIVE AFTER DARK',
    description: 'The Malaysian jungle calls through the darkness as rain brushes the leaves.',
    tag: 'Tropical night',
    layers: [
      loopPreset('Animals_Jungle-Night', 40, 28, 52, 0),
      loopPreset('Nature_Rain-Leaves', 20, 5, 30, 15),
      effectPreset('Bug_Katydid', 18, 4, 8, 20),
      effectPreset('Bug_Ticky', 15, 5, 10, 15),
    ],
  },
  {
    id: 'sanctuary',
    name: 'Forest sanctuary',
    eyebrow: 'LET THE TONES LINGER',
    description: 'Resonant gongs drift over gentle leaf rain and a breeze through the trees.',
    tag: 'Quiet reflection',
    layers: [
      loopPreset('Music_Gongs', 26, 18, 35, 0),
      loopPreset('Nature_Rain-Leaves', 22, 12, 30, 0),
      loopPreset('Nature_Wind', 8, 0, 15, 20),
      effectPreset('Bird_Sparrow', 18, 2, 5, 25, 3),
    ],
  },
  {
    id: 'all',
    name: 'All Nature sounds',
    eyebrow: 'THE COMPLETE COLLECTION',
    description: 'Every recording in one mix. An open playground for building your own scene.',
    tag: 'Explore',
    allSounds: true,
    layers: natureSounds.map((sound): SceneLayer => [sound.id, sound.kind === 'loop' ? 12 : 20]),
  },
];
const urbanScenes: Omit<Scene, 'collection'>[] = [
  {
    id: 'city-morning',
    name: 'City morning',
    eyebrow: 'THE NEIGHBOURHOOD WAKES',
    description: 'Birds and pigeons gather above a quiet city hum, with bells in the distance.',
    tag: 'Morning streets',
    layers: [
      loopPreset('Urban_Birds-City', 32, 20, 44, 0),
      loopPreset('Urban_Pigeons', 18, 5, 28, 15),
      loopPreset('Urban_City-Hum', 18, 10, 26, 0),
      effectPreset('Urban_Bird-Tweet', 26, 5, 10, 15, 3),
      effectPreset('Urban_Bells', 28, 2, 5, 25, 0),
    ],
  },
  {
    id: 'market-day',
    name: 'Market day',
    eyebrow: 'LIFE ON THE CORNER',
    description: 'Market chatter spills onto the street as traffic passes and a horn sounds.',
    tag: 'City bustle',
    layers: [
      loopPreset('Urban_Market', 38, 24, 48, 0),
      loopPreset('Urban_Street', 24, 12, 34, 5),
      effectPreset('Urban_Horn', 28, 3, 7, 20, 2),
      effectPreset('Urban_Bells', 22, 1, 4, 30, 0),
    ],
  },
  {
    id: 'rainy-city',
    name: 'Rainy streets',
    eyebrow: 'RAIN ON THE PAVEMENT',
    description: 'Tyres sweep over wet roads beneath gentle rain and distant highway traffic.',
    tag: 'After the rain',
    layers: [
      loopPreset('Urban_Wet-Road', 36, 24, 48, 0),
      loopPreset('Urban_Highway', 18, 8, 28, 10),
      loopPreset('Nature_Rain-Light', 24, 12, 34, 0),
      effectPreset('Urban_Horn', 22, 2, 5, 25, 2),
    ],
  },
  {
    id: 'working-city',
    name: 'Working city',
    eyebrow: 'A CITY IN MOTION',
    description: 'Construction and work vehicles fill the day, with a siren passing farther away.',
    tag: 'Urban activity',
    layers: [
      loopPreset('Urban_Construction', 32, 15, 44, 10),
      loopPreset('Urban_Garbage-Truck', 22, 5, 32, 25),
      loopPreset('Urban_Fire-Truck', 12, 0, 20, 45),
      loopPreset('Urban_City-Hum', 18, 10, 26, 0),
      effectPreset('Urban_Horn', 26, 3, 6, 20, 2),
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
    id: 'orbital-station',
    name: 'Orbital station',
    eyebrow: 'LIFE ABOVE THE WORLD',
    description: 'Station systems hum and breathe around you, punctuated by a quiet signal.',
    tag: 'Station interior',
    layers: [
      loopPreset('Space_Station', 36, 24, 48, 0),
      loopPreset('Space_Machines-Hum', 18, 8, 28, 5),
      loopPreset('Space_Hiss', 12, 5, 20, 15),
      effectPreset('Space_Pulsar', 20, 3, 7, 20, 0),
    ],
  },
  {
    id: 'starship-cruise',
    name: 'Starship cruise',
    eyebrow: 'A LONG WAY FROM HOME',
    description: 'Engines carry you through cosmic wind while galaxies drift past the windows.',
    tag: 'Deep-space voyage',
    layers: [
      loopPreset('Space_Engine', 36, 24, 48, 0),
      loopPreset('Space_Wind', 20, 8, 30, 10),
      loopPreset('Space_Galaxy-Flyby', 16, 0, 26, 25),
      loopPreset('Space_Solar', 10, 0, 18, 30),
      effectPreset('Space_Laser', 20, 2, 5, 30, 0),
    ],
  },
  {
    id: 'event-horizon',
    name: 'Event horizon',
    eyebrow: 'AT THE EDGE OF THE UNKNOWN',
    description: 'A deep black-hole drone, radiation pulses, and faint signals from the dark.',
    tag: 'Deep space',
    layers: [
      loopPreset('Space_Black-Hole', 34, 22, 46, 0),
      loopPreset('Space_Radiation', 18, 5, 28, 15),
      loopPreset('Space_Wind', 12, 0, 22, 20),
      effectPreset('Space_Pulsar', 24, 4, 9, 20, 0),
    ],
  },
  {
    id: 'alien-signal',
    name: 'Alien signal',
    eyebrow: 'SOMETHING OUT THERE',
    description: 'An unfamiliar craft resonates among shifting galaxy textures and solar flares.',
    tag: 'Otherworldly',
    layers: [
      loopPreset('Space_UFO', 30, 18, 42, 0),
      loopPreset('Space_Galaxy-Flyby-2', 18, 0, 28, 25),
      loopPreset('Space_Flare', 12, 0, 22, 30),
      effectPreset('Space_Laser', 24, 3, 7, 25, 0),
      effectPreset('Space_Pulsar', 18, 2, 5, 30, 0),
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

export function sceneMix(id: string): Mix {
  const scene = scenes.find((s) => s.id === id) ?? scenes[0];
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
