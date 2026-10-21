import site from '../content/site.json';

export { site };
export type Video = (typeof site.work.videos)[number];

// The seven sections, in order. Drives the menu, the scroll track and the ids.
export const sections = [
  { id: 'home', menu: 'Home', stop: 'HOME' },
  { id: 'about', menu: 'About', stop: 'PROFILE' },
  { id: 'stats', menu: 'Results', stop: 'SCORES' },
  { id: 'work', menu: 'Work', stop: 'PLAYS' },
  { id: 'brands', menu: 'Brands', stop: 'PARTY' },
  { id: 'process', menu: 'Process', stop: 'LEVELS' },
  { id: 'contact', menu: 'Contact', stop: 'CONTACT' },
] as const;

export const isPlaceholderForm = (url: string) => !url || url.includes('REPLACE_ME');
