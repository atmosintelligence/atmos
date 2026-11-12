// Every icon in the app lives here. One style: 24px grid, rounded 1.75px outlines, so
// they look like a set. Use <Icon name="alerts" size={22} />. Size defaults to 20.
// To add one, add a line to ICONS (an array of SVG path strings, or JSX for shapes).

const circle = (cx, cy, r) => <circle key={`${cx}${cy}${r}`} cx={cx} cy={cy} r={r} />;
const rect = (x, y, w, h, rx = 0) => <rect key={`${x}${y}${w}${h}`} x={x} y={y} width={w} height={h} rx={rx} />;

const ICONS = {
  // navigation
  overview:   [rect(3, 3, 7, 9, 1.5), rect(14, 3, 7, 5, 1.5), rect(14, 12, 7, 9, 1.5), rect(3, 16, 7, 5, 1.5)],
  alerts:     ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  automation: [rect(3, 4, 18, 18, 2), 'M16 2v4M8 2v4M3 10h18', 'M12 14v3l2 1'],
  devices:    [rect(5, 5, 14, 14, 2.5), rect(9, 9, 6, 6, 1), 'M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3'],
  history:    ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5', 'M12 7v5l3 2'],
  analysis:   ['M18 20V10M12 20V4M6 20v-6'],
  api:        ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6'],
  settings:   ['M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3', 'M1 14h6M9 8h6M17 16h6'],
  subscription: [rect(2, 5, 20, 14, 2.5), 'M2 10h20M6 15h4'],
  logout:     ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5M21 12H9'],

  // analysis pages
  lightingAnalysis:      ['M9 18h6M10 22h4', 'M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z'],
  temperatureAnalysis:   ['M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'],
  standbyAnalysis:       ['M12 22v-5M9 8V2M15 8V2', 'M18 8v5a6 6 0 0 1-12 0V8z'],
  trendsAnalysis:        ['M22 7l-8.5 8.5-5-5L2 17', 'M16 7h6v6'],
  environmentalAnalysis: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],

  // things in the room
  lightbulb:   ['M9 18h6M10 22h4', 'M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z'],
  thermometer: ['M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'],
  droplet:     ['M12 2.7s7 7.1 7 11.8a7 7 0 0 1-14 0C5 9.8 12 2.7 12 2.7z'],
  plug:        ['M12 22v-5M9 8V2M15 8V2', 'M18 8v5a6 6 0 0 1-12 0V8z'],
  zap:         ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
  ac:          ['M12 2v20M4.9 7l14.2 10M4.9 17l14.2-10', 'M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5'],
  fan:         [circle(12, 12, 1.8), 'M12 10.2C12 6 13 3 16 3s3 4-1 6', 'M13.8 12c4.2 0 7 1 7 4s-4 3-6-1', 'M12 13.8c0 4.2-1 7.2-4 7.200s-3-4 1-6', 'M10.2 12C6 12 3 11 3 8s4-3 6 1'],
  sun:         [circle(12, 12, 4), 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
  moon:        ['M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z'],

  // impact
  leaf:  ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],
  coin:  [circle(12, 12, 10), 'M8.5 7.5h7M8.5 11h7', 'M8.5 7.5c3.5 0 5.5 1.2 5.5 3.500S12 14.5 8.5 14.500l6 3.5'],
  tree:  ['M12 22v-6', 'M12 16c-4 0-6-2.5-6-5.5 0-2 1-3.5 2.5-4.400C9 4 10.3 2 12 2s3 2 3.5 4.100C17 7 18 8.5 18 10.500c0 3-2 5.5-6 5.500z'],
  gauge: ['M12 14l4-4', 'M3.3 18a10 10 0 1 1 17.4 0'],

  // actions
  plus:        ['M12 5v14M5 12h14'],
  close:       ['M18 6L6 18M6 6l12 12'],
  check:       ['M20 6L9 17l-5-5'],
  chevronDown: ['M6 9l6 6 6-6'],
  chevronRight:['M9 6l6 6-6 6'],
  arrowRight:  ['M5 12h14M12 5l7 7-7 7'],
  arrowLeft:   ['M19 12H5M12 19l-7-7 7-7'],
  arrowDown:   ['M12 5v14M5 12l7 7 7-7'],
  refresh:     ['M21 12a9 9 0 1 1-3-6.700L21 8', 'M21 3v5h-5'],
  link:        ['M10 13a5 5 0 0 0 7.5.500l3-3a5 5 0 0 0-7-7l-1.7 1.7', 'M14 11a5 5 0 0 0-7.5-.500l-3 3a5 5 0 0 0 7 7l1.7-1.7'],
  key:         [circle(7.5, 15.5, 5.5), 'M21 2l-9.6 9.600M15.5 7.500l3 3L22 7l-3-3'],
  download:    ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5M12 15V3'],
  file:        ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6M8 13h8M8 17h5'],
  trash:       ['M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6'],
  edit:        ['M12 20h9', 'M16.5 3.500a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
  copy:        [rect(9, 9, 13, 13, 2), 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
  play:        ['M6 4l14 8-14 8z'],
  menu:        ['M3 6h18M3 12h18M3 18h18'],
  info:        [circle(12, 12, 10), 'M12 16v-4M12 8h.01'],
  warning:     ['M10.3 3.900L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.900a2 2 0 0 0-3.4 0z', 'M12 9v4M12 17h.01'],
  clock:       [circle(12, 12, 10), 'M12 6v6l4 2'],
  calendar:    [rect(3, 4, 18, 18, 2), 'M16 2v4M8 2v4M3 10h18'],

  // product and trust
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'M9 12l2 2 4-4'],
  lock:   [rect(3, 11, 18, 11, 2), 'M7 11V7a5 5 0 0 1 10 0v4'],
  wifi:   ['M5 12.550a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.110a6 6 0 0 1 6.95 0M12 20h.01'],
  ai:     ['M12 3l1.9 5.100L19 10l-5.1 1.900L12 17l-1.9-5.100L5 10l5.1-1.900z', 'M19 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z'],
  sensor: [rect(5, 5, 14, 14, 2.5), circle(12, 12, 3), 'M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3'],
  user:   [circle(12, 8, 4), 'M4 21a8 8 0 0 1 16 0'],
  mapPin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z', circle(12, 10, 3)],
  layers: ['M12 2l10 5-10 5L2 7z', 'M2 17l10 5 10-5M2 12l10 5 10-5'],

  // places
  home:     ['M3 10.500L12 3l9 7.500V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
  office:   [rect(4, 2, 16, 20, 1.5), 'M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01'],
  building: [rect(4, 2, 16, 20, 1.5), 'M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01'],
  school:   ['M2 22h20M4 22V9l8-5 8 5v13M10 22v-6h4v6M12 4V1'],
  hospital: [rect(3, 3, 18, 18, 2.5), 'M12 8v8M8 12h8'],
  factory:  ['M2 20V10l6 4v-4l6 4V4h6v16z'],
};

export default function Icon({ name, size = 20, strokeWidth = 1.75, className = '', title }) {
  const shapes = ICONS[name];
  if (!shapes) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {shapes.map((s, i) => (typeof s === 'string' ? <path key={i} d={s} /> : s))}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(ICONS);
