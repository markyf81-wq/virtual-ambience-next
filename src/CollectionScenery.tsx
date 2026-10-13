import { useId } from 'react';

export default function CollectionScenery({
  collection,
  scene,
  small,
}: {
  collection: 'urban' | 'space';
  scene: string;
  small: boolean;
}) {
  const id = useId();
  const urban = collection === 'urban';
  const morning = scene === 'city-morning';
  const rain = scene === 'rainy-city';
  const blackHole = scene === 'event-horizon';
  const alien = scene === 'alien-signal';
  const sky = urban
    ? morning
      ? '#b39383'
      : rain
        ? '#536c78'
        : '#788b97'
    : alien
      ? '#152b32'
      : '#171d3b';
  const glow = urban ? '#e9c99d' : alien ? '#7ea9a4' : '#a291d1';

  return (
    <svg
      className={`scenery ${small ? 'small' : ''}`}
      viewBox="0 0 1000 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor={sky} />
          <stop offset="1" stopColor={urban ? '#afaf9b' : '#0d1527'} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor={glow} stopOpacity={urban ? '.4' : '.25'} />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-planet`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={alien ? '#87a99c' : '#9b93c6'} />
          <stop offset="1" stopColor="#28344d" />
        </linearGradient>
      </defs>
      <rect width="1000" height="500" fill={`url(#${id}-sky)`} />
      <ellipse cx="705" cy="155" rx="340" ry="235" fill={`url(#${id}-glow)`} />
      {urban ? (
        <>
          <circle cx="740" cy="110" r="30" fill={glow} opacity={rain ? '.3' : '.8'} />
          <g fill="#607581" opacity=".65">
            {Array.from({ length: 15 }, (_, i) => (
              <rect key={i} x={i * 74 - 25} y={160 + ((i * 37) % 100)} width="62" height="220" />
            ))}
          </g>
          <g fill="#364f5a">
            {Array.from({ length: 9 }, (_, i) => {
              const x = i * 125 - 40;
              const y = 220 + ((i * 31) % 100);
              return (
                <g key={i}>
                  <rect x={x} y={y} width="105" height={430 - y} />
                  {Array.from({ length: 12 }, (_, w) => (
                    <rect
                      key={w}
                      x={x + 14 + (w % 3) * 27}
                      y={y + 18 + Math.floor(w / 3) * 34}
                      width="10"
                      height="16"
                      fill={glow}
                      opacity={w % 4 === 0 ? '.65' : '.15'}
                    />
                  ))}
                </g>
              );
            })}
          </g>
          <path d="M0 405h1000v95H0Z" fill="#243942" />
          <path d="M425 400h155l125 100H270Z" fill={rain ? '#70858a' : '#455b60'} />
          <path d="M500 410v20m0 15v25m0 15v15" stroke={glow} strokeWidth="4" opacity=".5" />
          <g fill="#182f38">
            <rect x="90" y="310" width="7" height="120" />
            <path d="M93 310q0-22 30-22h28v6h-25q-24 0-24 19Z" />
            <rect x="855" y="310" width="7" height="120" />
            <path d="M858 310q0-22-30-22h-28v6h25q24 0 24 19Z" />
          </g>
          <g fill={glow} opacity=".65">
            <ellipse cx="145" cy="295" rx="12" ry="3" />
            <ellipse cx="805" cy="295" rx="12" ry="3" />
          </g>
          {rain && (
            <g stroke="#d2e2e5" opacity=".2">
              {Array.from({ length: 50 }, (_, i) => (
                <path key={i} d={`M${(i * 23) % 1000} ${(i * 47) % 500}l-8 22`} />
              ))}
            </g>
          )}
        </>
      ) : (
        <>
          {Array.from({ length: 85 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 139 + 18) % 1000}
              cy={(i * 67 + 25) % 500}
              r={i % 9 === 0 ? 2 : 0.8}
              fill="#e5e2f2"
              opacity={i % 4 === 0 ? '.8' : '.4'}
            />
          ))}
          {blackHole ? (
            <g transform="translate(650 185) rotate(-18)">
              <ellipse rx="150" ry="45" fill="none" stroke={glow} strokeWidth="20" opacity=".2" />
              <ellipse rx="136" ry="35" fill="none" stroke="#d7bd99" strokeWidth="4" opacity=".8" />
              <circle r="63" fill="#080e1b" />
              <circle r="65" fill="none" stroke={glow} strokeWidth="2" opacity=".6" />
            </g>
          ) : (
            <g>
              <circle cx="720" cy="145" r="85" fill={`url(#${id}-planet)`} />
              <ellipse
                cx="720"
                cy="145"
                rx="145"
                ry="25"
                transform="rotate(-22 720 145)"
                fill="none"
                stroke={glow}
                strokeWidth="5"
                opacity=".5"
              />
            </g>
          )}
          {scene === 'orbital-station' ? (
            <g transform="translate(320 240) rotate(-12)">
              <path d="M-40-14H45V14H-40Z" fill="#a9b5ba" />
              <path d="M-14-30H14V30H-14Z" fill="#d0d4c6" />
              <path
                d="M-130-50h65v35h-65zm0 65h65v35h-65zm195-65h65v35H65zm0 65h65v35H65Z"
                fill="#546487"
              />
              <path d="M-65 0H-40m85 0h20M-97-15v30m195-30v30" stroke="#bac7cb" strokeWidth="5" />
            </g>
          ) : (
            <path
              d="M65 340Q390 160 920 360"
              fill="none"
              stroke={glow}
              strokeWidth="2"
              opacity=".2"
            />
          )}
          <path d="M0 485Q300 365 620 470T1000 425V500H0Z" fill="#0b1b28" />
        </>
      )}
    </svg>
  );
}
