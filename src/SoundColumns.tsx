import { useEffect, useState } from 'react';
import type { Layer } from './data';
import type { LiveValues } from './audio/engine';
import SoundLayer from './SoundLayer';

type SoundColumnsProps = {
  layers: Layer[];
  autoEnabled: boolean;
  playing: boolean;
  liveValues: LiveValues;
  activeEvents: string[];
  previewingId: string | null;
  onChange: (id: string, changes: Partial<Layer>) => void;
  onRemove: (id: string) => void;
  onPreview: (layer: Layer) => Promise<void>;
};

const SINGLE_COLUMN_QUERY = '(max-width: 680px)';

export default function SoundColumns({
  layers,
  autoEnabled,
  playing,
  liveValues,
  activeEvents,
  previewingId,
  onChange,
  onRemove,
  onPreview,
}: SoundColumnsProps) {
  const [singleColumn, setSingleColumn] = useState(
    () => window.matchMedia(SINGLE_COLUMN_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(SINGLE_COLUMN_QUERY);
    const update = () => setSingleColumn(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const count = singleColumn ? 1 : 2;
  const columns = Array.from({ length: count }, (_, column) =>
    layers.filter((_, index) => index % count === column),
  );

  return columns.map((column, index) => (
    <div className="layer-column" key={index}>
      {column.map((layer) => (
        <SoundLayer
          key={layer.id}
          layer={layer}
          autoEnabled={autoEnabled}
          playing={playing}
          values={liveValues[layer.id]}
          active={activeEvents.includes(layer.id)}
          previewing={previewingId === layer.id}
          onChange={(changes) => onChange(layer.id, changes)}
          onRemove={() => onRemove(layer.id)}
          onPreview={onPreview}
        />
      ))}
    </div>
  ));
}
