// Place at: src/repoLib.js  (config for the repo card; reuses themes/sizes from ghLib.js)
import { DEFAULTS } from './ghLib';

export const REPO_ELEMENTS = {
  header: 'Header (avatar, owner, name)',
  desc: 'Description',
  topics: 'Topics',
  stats: 'Stats',
  langs: 'Languages',
  meta: 'Details (license, updated…)',
  footer: 'Footer',
};

export const REPO_STATS = [
  ['stars', 'Stars'], ['forks', 'Forks'], ['watchers', 'Watchers'], ['issues', 'Open issues'],
];

export const REPO_META = [
  ['license', 'License'], ['updated', 'Last updated'], ['release', 'Latest release'],
  ['homepage', 'Website'], ['created', 'Created'],
];

export const REPO_DEFAULTS = {
  ...DEFAULTS,
  fontScale: 110, avatarSize: 56, avatarRing: 0, bioLines: 4,
  showOwner: true, descSize: 100, descLines: 4, topicCount: 5, topicStyle: 'pills',
  statKeys: ['stars', 'forks', 'watchers', 'issues'],
  metaKeys: ['license', 'updated', 'release', 'homepage'],
  show: { header: true, desc: true, topics: true, stats: true, langs: true, meta: true, footer: true },
  order: ['header', 'desc', 'topics', 'stats', 'langs', 'meta', 'footer'],
};
