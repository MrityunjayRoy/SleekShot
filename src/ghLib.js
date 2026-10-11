export const SIZES = [
  { name: 'Square 1080×1080', w: 1080, h: 1080 },
  { name: 'Portrait 1080×1350', w: 1080, h: 1350 },
  { name: 'Link preview 1200×630', w: 1200, h: 630 },
  { name: 'Wide 1920×1080', w: 1920, h: 1080 },
  { name: 'Story 1080×1920', w: 1080, h: 1920 },
];

export const THEMES = {
  'GitHub Dark':  { cardBg: '#0d1117', text: '#e6edf3', muted: '#8b949e', border: '#30363d', accent: '#58a6ff' },
  'GitHub Light': { cardBg: '#ffffff', text: '#1f2328', muted: '#656d76', border: '#d0d7de', accent: '#0969da' },
  Midnight:       { cardBg: '#0b1020', text: '#e8ecff', muted: '#8f9bc7', border: '#232b4d', accent: '#7c8cff' },
  Dracula:        { cardBg: '#282a36', text: '#f8f8f2', muted: '#a3a8c3', border: '#44475a', accent: '#bd93f9' },
  Nord:           { cardBg: '#2e3440', text: '#eceff4', muted: '#9aa5b8', border: '#434c5e', accent: '#88c0d0' },
  Solarized:      { cardBg: '#fdf6e3', text: '#586e75', muted: '#93a1a1', border: '#eee8d5', accent: '#268bd2' },
  Rose:           { cardBg: '#1c1417', text: '#fde8ee', muted: '#c79aa8', border: '#3d2a31', accent: '#fb7185' },
  Forest:         { cardBg: '#0f1a14', text: '#e6f4ea', muted: '#8fb59c', border: '#24392c', accent: '#4ade80' },
  Mono:           { cardBg: '#000000', text: '#ffffff', muted: '#a1a1aa', border: '#27272a', accent: '#ffffff' },
};

export const FONTS = {
  System: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  Mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  Serif: 'Georgia, "Times New Roman", serif',
  Rounded: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
};

export const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5', Java: '#b07219', Go: '#00add8',
  Rust: '#dea584', 'C++': '#f34b7d', C: '#808080', 'C#': '#178600', Ruby: '#701516', PHP: '#4f5d95',
  Swift: '#f05138', Kotlin: '#a97bff', Dart: '#00b4ab', HTML: '#e34c26', CSS: '#563d7c', SCSS: '#c6538c',
  Shell: '#89e051', Vue: '#41b883', Svelte: '#ff3e00', Lua: '#000080', 'Jupyter Notebook': '#da5b0b',
  Dockerfile: '#384d54', Scala: '#c22d40', Elixir: '#6e4a7e', Haskell: '#5e5086', R: '#198ce7',
  MATLAB: '#e16737', Perl: '#0298c3', Zig: '#ec915c', Nix: '#7e7eff', Makefile: '#427819',
};

export const ELEMENTS = {
  header: 'Header (avatar, name, handle)',
  tagline: 'Custom tagline',
  bio: 'Bio',
  meta: 'Details (location, company…)',
  stats: 'Stats',
  langs: 'Top languages',
  repos: 'Top repositories',
  footer: 'Footer',
};

export const STAT_DEFS = [
  ['followers', 'Followers'], ['following', 'Following'], ['repos', 'Repositories'],
  ['stars', 'Stars'], ['gists', 'Gists'],
];

export const META_DEFS = [
  ['location', 'Location'], ['company', 'Company'], ['blog', 'Website'],
  ['twitter', 'X / Twitter'], ['joined', 'Joined'],
];

export const hexA = (hex, a) => {
  const h = String(hex).replace('#', '');
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(f, 16);
  if (Number.isNaN(n)) return hex;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export const DEFAULTS = {
  // canvas
  sizeName: 'Square 1080×1080', cw: 1080, ch: 1080, scale: 2,
  // background
  bg: true, mode: 'gradient', color: '#111827', c1: '#6366f1', c2: '#ec4899', angle: 135,
  auto: ['#222', '#444'], image: null, blur: 40,
  pattern: 'none', patternColor: '#ffffff', patternAlpha: 12,
  // card frame
  padding: 80, cardW: 100, radius: 24, borderW: 1, innerPad: 22, cardOpacity: 100,
  shadow: true, shadowAmt: 60, glow: false, accentBar: 'none',
  // theme
  theme: 'GitHub Dark', ...THEMES['GitHub Dark'],
  // type
  font: 'System', fontScale: 100, nameScale: 100, headingWeight: 700, gap: 14, align: 'left',
  // header
  headerLayout: 'row', showAvatar: true, avatarSize: 70, avatarShape: 'circle', avatarRing: 2,
  showBadge: true, bioLines: 3,
  // details / stats
  metaLayout: 'list', metaIcons: true, metaKeys: ['location', 'company', 'blog', 'joined'],
  statStyle: 'grid', statKeys: ['followers', 'following', 'repos', 'stars'], statAccent: false, statDivider: true,
  // languages / repos
  langCount: 5, showPct: true, repoCount: 2, sectionLabels: true,
  // elements
  show: { header: true, tagline: true, bio: true, meta: true, stats: true, langs: true, repos: false, footer: true },
  order: ['header', 'tagline', 'bio', 'meta', 'stats', 'langs', 'repos', 'footer'],
};
