export interface Size {
  name: string;
  w: number;
  h: number;
}

export type BgMode = "solid" | "gradient" | "auto" | "blur" | "image";
export type PatternMode = "none" | "dots" | "grid" | "lines";

/* ------------------------------- YouTube ------------------------------- */

export interface VideoData {
  title: string;
  channel: string;
  thumb: string;
  avatar: string;
  duration: string;
  views: string;
  ago: string;
}

export interface VideoStyle {
  mode: BgMode;
  color: string;
  c1: string;
  c2: string;
  angle: number;
  pattern: PatternMode;
  patternColor: string;
  patternAlpha: number;
  auto: string[];
  image: string | null;
  blur: number;
  padding: number;
  radius: number;
  shadow: boolean;
  size: Size;
  showAvatar: boolean;
  showStats: boolean;
  showDuration: boolean;
}

/* ---------------------------------- Twitter / X ------------------------ */

export interface TweetMedia {
  type: "photo" | "video";
  url: string;
  poster: string;
  alt: string;
  aspect: number;
}

export interface QuotedTweet {
  authorName: string;
  handle: string;
  avatar: string;
  text: string;
  media: TweetMedia[];
}

export interface TweetData {
  id: string;
  url: string;
  text: string;
  authorName: string;
  handle: string;
  avatar: string;
  verified: boolean;
  createdAt: string;
  date: string;
  time: string;
  replies: string;
  retweets: string;
  likes: string;
  quotes: string;
  views: string;
  media: TweetMedia[];
  quoted: QuotedTweet | null;
}

export interface TweetShow {
  avatar: boolean;
  name: boolean;
  handle: boolean;
  verified: boolean;
  logo: boolean;
  text: boolean;
  media: boolean;
  quoted: boolean;
  actions: boolean;
  timestamp: boolean;
}

export interface TweetStyle {
  sizeName: string;
  cw: number;
  ch: number;
  scale: number;
  bg: boolean;
  mode: BgMode;
  color: string;
  c1: string;
  c2: string;
  angle: number;
  auto: string[];
  image: string | null;
  blur: number;
  pattern: PatternMode;
  patternColor: string;
  patternAlpha: number;
  padding: number;
  cardW: number;
  radius: number;
  borderW: number;
  innerPad: number;
  theme: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  fontScale: number;
  gap: number;
  show: TweetShow;
  size: Size;
}

/* ------------------------------ GitHub profile -------------------------- */

export interface Lang {
  name: string;
  pct: number;
}

export interface TopRepo {
  name: string;
  desc: string;
  lang: string;
  stars: string;
  forks: string;
}

export interface ProfileData {
  name: string;
  login: string;
  bio: string;
  location: string;
  company: string;
  blog: string;
  twitter: string;
  joined: string;
  followers: string;
  following: string;
  repos: string;
  gists: string;
  stars: string;
  badge: string;
  tagline: string;
  footer: string;
  langs: Lang[];
  topRepos: TopRepo[];
  avatar: string;
}

export interface ProfileShow {
  header: boolean;
  tagline: boolean;
  bio: boolean;
  meta: boolean;
  stats: boolean;
  langs: boolean;
  repos: boolean;
  footer: boolean;
}

export interface ProfileStyle {
  sizeName: string;
  cw: number;
  ch: number;
  scale: number;
  bg: boolean;
  mode: BgMode;
  color: string;
  c1: string;
  c2: string;
  angle: number;
  auto: string[];
  image: string | null;
  blur: number;
  pattern: PatternMode;
  patternColor: string;
  patternAlpha: number;
  padding: number;
  cardW: number;
  radius: number;
  borderW: number;
  innerPad: number;
  cardOpacity: number;
  shadow: boolean;
  shadowAmt: number;
  glow: boolean;
  accentBar: "none" | "top" | "left";
  theme: string;
  cardBg: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  font: string;
  fontScale: number;
  nameScale: number;
  headingWeight: number;
  gap: number;
  align: "left" | "center";
  headerLayout: "row" | "stack";
  showAvatar: boolean;
  avatarSize: number;
  avatarShape: "circle" | "rounded" | "square";
  avatarRing: number;
  showBadge: boolean;
  bioLines: number;
  metaLayout: "list" | "inline";
  metaIcons: boolean;
  metaKeys: string[];
  statStyle: "grid" | "inline" | "pills";
  statKeys: string[];
  statAccent: boolean;
  statDivider: boolean;
  langCount: number;
  showPct: boolean;
  repoCount: number;
  sectionLabels: boolean;
  show: ProfileShow;
  order: string[];
  size: Size;
}

/* ------------------------------ GitHub repo ----------------------------- */

export interface RepoData {
  owner: string;
  name: string;
  desc: string;
  avatar: string;
  language: string;
  stars: string;
  forks: string;
  watchers: string;
  issues: string;
  license: string;
  homepage: string;
  updated: string;
  created: string;
  topics: string[];
  langs: Lang[];
  stamp: string;
  stampSub: string;
  footer: string;
}

export interface RepoStyle {
  sizeName: string;
  cw: number;
  ch: number;
  scale: number;
  bg: boolean;
  mode: BgMode;
  color: string;
  c1: string;
  c2: string;
  angle: number;
  auto: string[];
  image: string | null;
  blur: number;
  pattern: PatternMode;
  patternColor: string;
  patternAlpha: number;
  padding: number;
  cardW: number;
  ratio: string;
  radius: number;
  borderW: number;
  innerPad: number;
  shadow: boolean;
  shadowAmt: number;
  palette: string;
  ink: string;
  a1: string;
  a2: string;
  a3: string;
  text: string;
  seed: number;
  blobs: number;
  blobSize: number;
  artAlpha: number;
  ring: boolean;
  geo: boolean;
  stripes: boolean;
  dots: boolean;
  scrim: number;
  fontPair: string;
  nameScale: number;
  nameCase: "none" | "lowercase" | "uppercase" | "capitalize";
  nameBreak: boolean;
  descSize: number;
  descLines: number;
  align: "left" | "center";
  statSize: number;
  showOwner: boolean;
  showLang: boolean;
  showStamp: boolean;
  showDesc: boolean;
  showTopics: boolean;
  showStats: boolean;
  showMeta: boolean;
  showEdgeBar: boolean;
  showFooter: boolean;
  showArt: boolean;
  statKeys: string[];
  statStyle: "big" | "compact";
  topicCount: number;
  metaKeys: string[];
  stampAngle: number;
  size: Size;
}