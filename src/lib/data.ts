import raw from '../content/site.json';

// Lists that may be empty in site.json need explicit types (an empty JSON array infers never[]).
export type StatRow = { video: string; label: string; views: number; likes: number; comments: number; shares: number; saves: number };
export type Testimonial = { quote: string; brand: string; role: string };
type Site = Omit<typeof raw, 'stats' | 'brands'> & {
  stats: Omit<typeof raw.stats, 'rows'> & { rows: StatRow[] };
  brands: Omit<typeof raw.brands, 'rowOne' | 'rowTwo' | 'testimonials'> & {
    rowOne: string[];
    rowTwo: string[];
    testimonials: Testimonial[];
  };
};
export const site = raw as Site;
export type Video = (typeof site.work.videos)[number];

// Results and Brands stay hidden until they have real content in site.json.
export const showStats = site.stats.rows.length > 0;
export const showBrands =
  site.brands.rowOne.length + site.brands.rowTwo.length + site.brands.testimonials.length > 0;

// All sections, in order. Drives the menu, the scroll track and the ids.
const allSections = [
  { id: 'home', menu: 'Home', stop: 'HOME' },
  { id: 'about', menu: 'About', stop: 'PROFILE' },
  { id: 'stats', menu: 'Results', stop: 'SCORES' },
  { id: 'work', menu: 'Work', stop: 'PLAYS' },
  { id: 'brands', menu: 'Brands', stop: 'PARTY' },
  { id: 'process', menu: 'Process', stop: 'LEVELS' },
  { id: 'contact', menu: 'Contact', stop: 'CONTACT' },
] as const;

export const sections = allSections.filter(
  (s) => (s.id !== 'stats' || showStats) && (s.id !== 'brands' || showBrands),
);

// "Level N" eyebrow for a section, numbered by what's currently shown.
export const level = (id: (typeof allSections)[number]['id']) =>
  `Level ${sections.findIndex((s) => s.id === id)}`;

export const isPlaceholderForm = (url: string) => !url || url.includes('REPLACE_ME');
