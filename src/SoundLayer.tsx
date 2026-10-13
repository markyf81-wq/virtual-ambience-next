import { ChevronDown, Headphones, Play, Square, Trash2, Volume2, VolumeX } from 'lucide-react';
import { soundById, type Layer } from './data';
import type { LiveValues } from './audio/engine';
import Slider from './Slider';
import Knob from './Knob';
import SoundIcon from './SoundIcon';

type SoundLayerProps = {
  layer: Layer;
  autoEnabled: boolean;
  playing: boolean;
  values?: LiveValues[string];
  active: boolean;
  previewing: boolean;
  onChange: (changes: Partial<Layer>) => void;
  onRemove: () => void;
  onPreview: (layer: Layer) => Promise<void>;
};

export default function SoundLayer({
  layer,
  autoEnabled,
  playing,
  values,
  active,
  previewing,
  onChange,
  onRemove,
  onPreview,
}: SoundLayerProps) {
  const sound = soundById.get(layer.soundId)!;
  const showAutoValues = autoEnabled && !layer.muted;
  const showLive = showAutoValues && (playing || Boolean(values));
  const updating = showAutoValues && playing && values?.updating === true;
  const loopPlaying =
    sound.kind === 'loop' && playing && !layer.muted && (values?.volume ?? 0) > 0.1;
  return (
    <div className={`sound-layer ${layer.muted ? 'muted' : ''}`}>
      <div className="layer-top">
        <span className={`sound-icon ${active || loopPlaying ? 'event-active' : ''}`}>
          <SoundIcon name={sound.icon} />
        </span>
        <div className="layer-name">
          <strong>{sound.name}</strong>
        </div>
        <button
          className="icon-button mute-button"
          aria-label={`${layer.muted ? 'Unmute' : 'Mute'} ${sound.name}`}
          aria-pressed={layer.muted}
          onClick={() => onChange({ muted: !layer.muted })}
        >
          {layer.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
      <div className="sound-controls">
        {sound.kind === 'loop' ? (
          <Slider
            label="Volume"
            value={showAutoValues && values ? values.volume : layer.volume}
            step={showLive ? 0.1 : 1}
            live={showLive}
            updating={updating}
            onChange={(volume) => onChange({ volume })}
          />
        ) : (
          <Slider
            label="Frequency"
            value={
              showAutoValues && values ? values.frequency : Number((layer.rate * 5).toFixed(1))
            }
            step={showLive ? 0.1 : 0.5}
            live={showLive}
            updating={updating}
            onChange={(percent) => onChange({ rate: percent / 5 })}
          />
        )}
        <details className="more-controls">
          <summary className="more-controls-heading" aria-label={`${sound.name} more controls`}>
            <span>More controls</span>
            <ChevronDown size={14} aria-hidden="true" />
          </summary>
          <div className="more-controls-content">
            {sound.kind === 'effect' && (
              <div className="control-group">
                <Slider
                  label="Min volume"
                  value={layer.effectMin}
                  onChange={(effectMin) =>
                    onChange({
                      effectMin: Math.min(effectMin, layer.effectMax),
                    })
                  }
                />
                <Slider
                  label="Max volume"
                  value={layer.effectMax}
                  onChange={(effectMax) =>
                    onChange({
                      effectMax: Math.max(effectMax, layer.effectMin),
                    })
                  }
                />
                <Slider
                  label="Pitch variation"
                  value={layer.pitch}
                  max={30}
                  onChange={(pitch) => onChange({ pitch })}
                />
              </div>
            )}
            {autoEnabled && (
              <div className="auto-options">
                <h4 className="auto-controls-heading">
                  {sound.kind === 'loop' ? 'Auto mode controls' : 'Auto mode frequency controls'}
                </h4>
                <div className="auto-options-content">
                  {sound.kind === 'loop' ? (
                    <>
                      <div className="auto-knobs">
                        <Knob
                          label="Min volume"
                          value={layer.min}
                          onChange={(min) =>
                            onChange({
                              min: Math.min(min, layer.max),
                            })
                          }
                        />
                        <Knob
                          label="Max volume"
                          value={layer.max}
                          onChange={(max) =>
                            onChange({
                              max: Math.max(max, layer.min),
                            })
                          }
                        />
                        <Knob
                          label="Chance to silence"
                          value={layer.offChance}
                          onChange={(offChance) => onChange({ offChance })}
                        />
                      </div>
                      <fieldset className="frequency-control">
                        <legend>How often volume changes</legend>
                        <div>
                          {(['slow', 'medium', 'frequent'] as const).map((frequency) => (
                            <label
                              key={frequency}
                              className={layer.changeFrequency === frequency ? 'selected' : ''}
                            >
                              <input
                                type="radio"
                                name={`frequency-${layer.id}`}
                                value={frequency}
                                checked={layer.changeFrequency === frequency}
                                onChange={() =>
                                  onChange({
                                    changeFrequency: frequency,
                                  })
                                }
                              />
                              {frequency === 'slow'
                                ? 'Slow'
                                : frequency === 'medium'
                                  ? 'Medium'
                                  : 'Frequent'}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </>
                  ) : (
                    <div className="auto-knobs">
                      <Knob
                        label="Min frequency"
                        value={Number((layer.minRate * 5).toFixed(1))}
                        min={0}
                        step={0.5}
                        onChange={(percent) =>
                          onChange({
                            minRate: Math.min(percent / 5, layer.maxRate),
                          })
                        }
                      />
                      <Knob
                        label="Max frequency"
                        value={Number((layer.maxRate * 5).toFixed(1))}
                        min={0}
                        step={0.5}
                        onChange={(percent) =>
                          onChange({
                            maxRate: Math.max(percent / 5, layer.minRate),
                          })
                        }
                      />
                      <Knob
                        label="Chance to silence"
                        value={layer.offChance}
                        onChange={(offChance) => onChange({ offChance })}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            {sound.kind === 'effect' && (
              <label className="switch-row effect-spatial">
                <span>
                  <Headphones size={13} /> Spatial audio
                </span>
                <input
                  type="checkbox"
                  aria-label={`${sound.name} spatial audio`}
                  checked={layer.spatial}
                  onChange={(e) => onChange({ spatial: e.target.checked })}
                />
              </label>
            )}
            <div className="sound-actions">
              <button
                className="text-button"
                onClick={() => void onPreview(layer)}
                aria-label={`${previewing ? 'Stop' : 'Preview'} ${sound.name}`}
                aria-pressed={previewing}
                title={
                  previewing
                    ? 'Stop this preview'
                    : sound.kind === 'loop'
                      ? 'Preview one complete loop'
                      : undefined
                }
              >
                {previewing ? <Square size={13} /> : <Play size={13} />}
                {previewing ? 'Stop sound' : 'Preview sound'}
              </button>
              <button className="remove-button" onClick={onRemove}>
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
