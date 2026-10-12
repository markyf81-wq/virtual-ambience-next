import { useId, type CSSProperties } from 'react';

type SliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  live?: boolean;
  automated?: boolean;
  disabled?: boolean;
};

export default function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  live = false,
  automated = false,
  disabled = false,
}: SliderProps) {
  const id = useId();
  const progress = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <label
      className={`slider ${live ? 'live-slider' : ''} ${automated ? 'automated-slider' : ''} ${disabled ? 'disabled-slider' : ''}`}
      htmlFor={id}
    >
      <span>
        <span>{label}</span>
        <output htmlFor={id} aria-live="off">
          {live && <small className="live-label">Auto</small>}
          {value}%
        </output>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={live || disabled}
        aria-label={label}
        aria-valuetext={`${value}%${live ? ', controlled by Auto mode' : ''}`}
        title={live ? 'Controlled by Auto mode.' : undefined}
        style={{ '--fill': `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
