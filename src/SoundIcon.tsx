import {
  AudioLines,
  Bird,
  Bug,
  Leaf,
  CloudRain,
  Waves,
  Wind,
  CloudLightning,
  Music2,
} from 'lucide-react';

export default function SoundIcon({ name, size = 20 }: { name: string; size?: number }) {
  const icons: Record<string, typeof Wind> = {
    bird: Bird,
    bug: Bug,
    frog: Leaf,
    rain: CloudRain,
    water: Waves,
    wind: Wind,
    storm: CloudLightning,
    music: Music2,
  };
  const Icon = icons[name] ?? AudioLines;
  return <Icon size={size} strokeWidth={1.5} />;
}
