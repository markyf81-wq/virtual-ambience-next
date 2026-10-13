import { useId, useRef, type KeyboardEvent, type PointerEvent } from 'react';

type KnobProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export default function Knob({ label, value, onChange, min = 0, max = 100, step = 1 }: KnobProps) {
  const labelId = useId();
  const drag = useRef<number | null>(null);
  const progress = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const circumference = 2 * Math.PI * 28;
  const arc = circumference * 0.75;
  const update = (next: number) => {
    const rounded = min + Math.round((next - min) / step) * step;
    onChange(Math.max(min, Math.min(max, Number(rounded.toFixed(3)))));
  };

  function followPointer(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    // The dial's centre has no useful angle; avoid jitter while passing through it.
    if (Math.hypot(x, y) < 6) return;
    const angle = (Math.atan2(x, -y) * 180) / Math.PI;
    const dialAngle = Math.max(-135, Math.min(135, angle));
    update(min + ((dialAngle + 135) / 270) * (max - min));
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !event.isPrimary) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = event.pointerId;
    followPointer(event);
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (drag.current !== event.pointerId) return;
    followPointer(event);
  }

  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (drag.current !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    const increments: Record<string, number> = {
      ArrowUp: step,
      ArrowRight: step,
      ArrowDown: -step,
      ArrowLeft: -step,
      PageUp: step * 10,
      PageDown: -step * 10,
    };
    if (event.key === 'Home' || event.key === 'End' || event.key in increments) {
      event.preventDefault();
      update(
        event.key === 'Home' ? min : event.key === 'End' ? max : value + increments[event.key],
      );
    }
  }

  return (
    <div className="knob-control">
      <span className="knob-label" id={labelId}>
        {label}
      </span>
      <div
        className="rotary-dial"
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${Math.round(value)}%`}
        title="Drag around the dial. Use arrow keys for small adjustments."
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerEnd}
        onPointerCancel={pointerEnd}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onKeyDown={keyDown}
      >
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle
            className="knob-track"
            cx="32"
            cy="32"
            r="28"
            fill="none"
            strokeDasharray={`${arc} ${circumference - arc}`}
            transform="rotate(135 32 32)"
          />
          <circle
            className="knob-progress"
            cx="32"
            cy="32"
            r="28"
            fill="none"
            strokeDasharray={`${arc * progress} ${circumference - arc * progress}`}
            transform="rotate(135 32 32)"
          />
        </svg>
        <span className="knob-face" aria-hidden="true" />
        <span
          className="knob-pointer"
          style={{ transform: `rotate(${-135 + progress * 270}deg)` }}
          aria-hidden="true"
        />
        <span className="knob-value" aria-hidden="true">
          {Math.round(value)}
          <small>%</small>
        </span>
      </div>
    </div>
  );
}
