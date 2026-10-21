// Pixel art as character grids. Each character maps to a colour in the
// sprite's palette; '.' is transparent. Rendered by Pixel.astro as crisp SVG.

export type Sprite = { rows: string[]; palette: Record<string, string> };

const mono = (rows: string[]): Sprite => ({ rows, palette: { '#': 'currentColor' } });

// Original boxy 4x4: roof rack, two-pane windows, tri-stripe on the side.
export const truck: Sprite = {
  rows: [
    '....OOOOOOOOOO......',
    '...OLLLLLLLLLLO.....',
    '...OBWWWOBWWWWBO....',
    '...OBWWWOBWWWWWBO...',
    'OOOOBBBBBBBBBBBBOOOO',
    'OBBBBBBBBBBBBBBBBBHO',
    'OBBTTTTRRRRNNNNBBBBO',
    'OBBBBBBBBBBBBBBBBBBO',
    'OOOKKKOOOOOOOOKKKOOO',
    '..KKGKK......KKGKK..',
    '..KKKKK......KKKKK..',
    '...KKK........KKK...',
  ],
  palette: {
    O: '#1E0F33', B: '#6B3FA0', L: '#8A5CC4', W: '#CDEFF2', H: '#FFE9A8',
    T: '#2FD3C1', R: '#F0625A', N: '#F6AE5E', K: '#15101F', G: '#D9B856',
  },
};

export const palm: Sprite = {
  rows: [
    '..GG.GG..',
    '.GGGGGGG.',
    'GGG.T.GGG',
    'G...T...G',
    '....T....',
    '....T....',
    '...T.....',
    '...T.....',
    '...T.....',
    '..SSSS...',
  ],
  palette: { G: '#24B8A8', T: '#8A5A2B', S: '#C9A43A' },
};

export const house: Sprite = mono([
  '.....#......',
  '....#.#.....',
  '...#...#....',
  '..#.....#...',
  '.#########..',
  '.#.#.#.#.#..',
  '.#.#.#.#.#..',
  '.#.#.#.#.#..',
  '###########.',
]);

export const hills: Sprite = {
  rows: [
    '.......HH...............',
    '.....HHHHHH.......HH....',
    '...HHHHHHHHHH...HHHHHH..',
    '.HHHHHHHHHHHHHHHHHHHHHH.',
    'HHHHHHHHHHHHHHHHHHHHHHHH',
  ],
  palette: { H: 'currentColor' },
};

export const cloud: Sprite = {
  rows: ['...WWWW.....', '.WWWWWWWWW..', 'WWWWWWWWWWWW'],
  palette: { W: 'currentColor' },
};

export const star = mono(['..#..', '.###.', '#####', '.###.', '..#..']);
export const twinkle = mono(['.#.', '###', '.#.']);

export const icons = {
  play: mono(['#....', '###..', '#####', '###..', '#....']),
  heart: mono(['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...']),
  eye: mono(['..#####..', '.#..#..#.', '#..###..#', '.#..#..#.', '..#####..']),
  comment: mono(['########', '#......#', '#.#.#.##', '#......#', '########', '.##.....', '.#......']),
  share: mono(['....#..', '....##.', '#######', '#...##.', '#...#..', '#......', '#......']),
  save: mono(['#####', '#####', '#####', '#####', '##.##', '#...#']),
  quote: mono(['##..##.', '##..##.', '.#...#.', '#...#..']),
  arrowDown: mono(['#######', '.#####.', '..###..', '...#...']),
};

export type PixelIconName = keyof typeof icons;
