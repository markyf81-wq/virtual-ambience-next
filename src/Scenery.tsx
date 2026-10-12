const palettes: Record<string, string[]> = {
  forest: ['#66877e', '#abb5a0', '#dae0b7', '#54716b', '#324f4b', '#1e3935'],
  storm: ['#526976', '#8396a0', '#c3cbbf', '#45606b', '#2b454f', '#20363e'],
  dusk: ['#807b7e', '#c3a28e', '#f4d5a0', '#827e79', '#555e56', '#343f37'],
  morning: ['#90a79c', '#c3c9ac', '#ffe7a8', '#8b9c83', '#5a7966', '#35564c'],
  night: ['#293b52', '#526679', '#c9d8d9', '#344e5d', '#243e49', '#182f35'],
  downpour: ['#526f73', '#899f9d', '#c4d4c7', '#506f6c', '#325552', '#223e3d'],
};
function Pine({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} fill={color}>
      <path d="M-2 0h4v-100h-4zM0-145l-24 49h15l-27 45h17l-30 45h98L19-51h17L9-96h15z" />
    </g>
  );
}
export default function Scenery({ scene, small = false }: { scene: string; small?: boolean }) {
  const p = palettes[scene] ?? palettes.forest;
  const night = scene === 'night';
  const rain = scene === 'storm' || scene === 'downpour';
  return (
    <svg
      className={`scenery ${small ? 'small' : ''}`}
      viewBox="0 0 1000 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${scene}-${small}`} x2="0" y2="1">
          <stop stopColor={p[0]} />
          <stop offset="1" stopColor={p[1]} />
        </linearGradient>
        <linearGradient id={`mist-${scene}-${small}`} x2="0" y2="1">
          <stop stopColor={p[1]} stopOpacity=".65" />
          <stop offset="1" stopColor={p[1]} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`sun-${scene}-${small}`}>
          <stop stopColor={p[2]} stopOpacity=".4" />
          <stop offset="1" stopColor={p[2]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="500" fill={`url(#sky-${scene}-${small})`} />
      <circle cx="725" cy="110" r="135" fill={`url(#sun-${scene}-${small})`} />
      <circle cx="725" cy="110" r={night ? 19 : 30} fill={p[2]} opacity=".8" />
      {night &&
        Array.from({ length: 25 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 137 + 70) % 1000}
            cy={(i * 53 + 12) % 190}
            r={i % 3 === 0 ? 1.5 : 0.7}
            fill="#e6ede7"
            opacity=".5"
          />
        ))}
      <path
        d="M0 245L105 170 170 210 280 122 380 198 435 151 570 240 670 188 740 227 850 156 1000 230V500H0Z"
        fill={p[3]}
        opacity=".65"
      />
      <path d="M0 300Q140 220 270 260T530 230T800 265T1000 230V500H0Z" fill={p[3]} />
      {Array.from({ length: 32 }, (_, i) => (
        <Pine
          key={`a${i}`}
          x={i * 34 - 20}
          y={330 + (i % 5) * 8}
          size={0.35 + (i % 4) * 0.12}
          color={p[4]}
        />
      ))}
      <path d="M0 340Q150 290 360 340T650 320T1000 305V500H0Z" fill={p[4]} />
      <path
        d="M450 320Q550 355 470 400T580 500H790Q580 410 595 380T500 320Z"
        fill={p[1]}
        opacity=".22"
      />
      <path d="M0 250H1000V405H0Z" fill={`url(#mist-${scene}-${small})`} opacity=".27" />
      {[
        [-20, 480, 2.5],
        [65, 465, 1.65],
        [135, 460, 1.4],
        [210, 470, 1.1],
        [820, 490, 1.55],
        [885, 480, 2.05],
        [960, 490, 2.7],
        [1020, 500, 2.4],
      ].map(([x, y, size], i) => (
        <Pine key={i} x={x} y={y} size={size} color={p[5]} />
      ))}
      <path d="M0 465Q200 420 420 490T1000 460V500H0Z" fill={p[5]} />
      {rain && (
        <g stroke="#d2e4e2" opacity=".15">
          {Array.from({ length: 45 }, (_, i) => (
            <path key={i} d={`M${(i * 79) % 1000} ${(i * 37) % 470}l-5 20`} />
          ))}
        </g>
      )}
    </svg>
  );
}
