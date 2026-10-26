// ---------------------------------------------------------------------------
// EDITABLE ART
//
// Every sprite is a tiny ASCII picture. Each character maps to a colour in
// PALETTE below. The letter "x" is special: it is the "paint" channel and can
// be recoloured per drawing call (cars, shirts, jackets...).
//
// To replace the built-in art with PNG files, see public/assets/manifest.json
// and README.md. Files in that manifest win over anything defined here.
// ---------------------------------------------------------------------------

export const PALETTE = {
  k: "#161222", // ink / outline
  x: "#e8473f", // paint channel (recolourable)
  X: "#a32c35", // dark accent
  w: "#fff6e5", // paper white
  e: "#bde7ff", // glass / ice
  u: "#7bd4ff", // cyan
  b: "#3b7ed6", // blue
  B: "#22508f", // dark blue
  g: "#4fc45c", // green
  G: "#237a37", // dark green
  l: "#a8f0a0", // light green
  y: "#ffd447", // yellow
  o: "#f39433", // orange
  p: "#a463e8", // purple
  P: "#6b35b8", // dark purple
  n: "#8a5a3b", // brown
  N: "#4d3120", // dark brown
  s: "#c9c2b6", // light stone
  S: "#777069", // dark stone
  m: "#b0b6c8", // metal light
  M: "#6d7385", // metal dark
  h: "#ffbe8f", // skin
  H: "#d18a5f", // skin shadow
  r: "#f06272", // pink
  t: "#59c6b5", // teal
  d: "#2b2b3a", // deep shadow
};

export const SPRITES = {
  car: {
    rows: [
      ".kkkkkkkk.",
      "kkxxxxxxkk",
      "kkxxxxxxkk",
      "kkxeeeexkk",
      ".kxxxxxxk.",
      ".kxxxxxxk.",
      ".kxxxxxxk.",
      ".kxxxxxxk.",
      ".kxeeeexk.",
      ".kxeeeexk.",
      ".kxxxxxxk.",
      ".kxxxxxxk.",
      "kkxeeeexkk",
      "kkxxxxxxkk",
      ".kkkkkkkk.",
    ],
  },

  runner: {
    rows: [
      "..kkkk..",
      ".khhhhk.",
      ".khkhhk.",
      ".khhhhk.",
      "..kkkk..",
      "kkxxxxkk",
      "kxkxxkxk",
      "kxkxxkxk",
      ".kxxxxk.",
      "..kkkk..",
      "..k..k..",
      ".kk..kk.",
    ],
  },

  cactus: {
    rows: [
      "...kk...",
      "..kggk..",
      "..kggk..",
      "k.kggk.k",
      "gkkggkkg",
      "ggkggkgg",
      ".kkggkk.",
      "..kggk..",
      "..kggk..",
      "..kggk..",
      "..kggk..",
      "..kggk..",
      ".kkggkk.",
      "..kkkk..",
    ],
  },

  tree: {
    rows: [
      "...kkkk...",
      "..kggggk..",
      ".kgllgggk.",
      "kgllgggggk",
      "kggggggggk",
      ".kgGgggGk.",
      "..kgggggk.",
      "...kggk...",
      "..kgGGgk..",
      ".kgGggGgk.",
      "kggggggggk",
      "kgGggggGgk",
      ".kgGggggk.",
      "..kgggggk.",
      "...kGGk...",
      "....kk....",
      "....nn....",
      "...knnk...",
    ],
  },

  skier: {
    rows: [
      "..kkkk..",
      ".kxxxxk.",
      ".kxwwxk.",
      ".kxxxxk.",
      "..kkkk..",
      "..kxxk..",
      ".kkxxkk.",
      "..kxxk..",
      "..k..k..",
      ".kk..kk.",
      ".kk..kk.",
      "k......k",
    ],
  },

  mole: {
    rows: [
      "..kkkkkk..",
      ".khhhhhhk.",
      "khkhhhkhhk",
      "khhhhhhhhk",
      "khhkhhkhhk",
      ".khhhhhhk.",
      "..kNNNNk..",
      ".kNNNNNNk.",
      "..kkkkkk..",
    ],
  },

  bomb: {
    rows: [
      "...k....",
      "..k.k...",
      "..kkk...",
      ".kkkkkk.",
      "kkMMMMkk",
      "kMmmmsMk",
      "kMmmmsMk",
      "kMmmmmMk",
      ".kkkkkk.",
      "........",
    ],
  },

  star: {
    rows: [
      "....k....",
      "...kyk...",
      "...kyk...",
      "kkkkyykkk",
      ".kyyyyyk.",
      "..kyyyk..",
      ".kyykyyk.",
      ".kyk.kyk.",
      "..k...k..",
    ],
  },

  ship: {
    rows: [
      "....k.....",
      "...kwk....",
      "...kwk....",
      "..kwwwk...",
      ".kwwwwwk..",
      "kwwwwwwwk.",
      "kkkkkkkkk.",
      ".knnnnnnk.",
      "..knnnnk..",
      "...kkkk...",
      "..........",
    ],
  },

  basket: {
    rows: [
      "kkkkkkkkkkkkkk",
      "knnnnnnnnnnnnk",
      "knNNNNNNNNNNnk",
      "knnnnnnnnnnnnk",
      "kknnnnnnnnnnkk",
      "k.knnnnnnnnk.k",
      "..kkkkkkkkkk..",
      "..............",
      "..............",
    ],
  },

  ball: {
    rows: [
      ".kkkk.",
      "kwwwwk",
      "kwkkwk",
      "kwkkwk",
      "kwwwwk",
      ".kkkk.",
    ],
  },

  keeper: {
    rows: [
      "..kkkkkk..",
      ".kxxxxxxk.",
      ".kxhhhhxk.",
      ".kxhkkhxk.",
      ".kxhhhhxk.",
      ".kxxxxxxk.",
      "kkxxxxxxkk",
      "kxkxxxxkxk",
      "kxkxxxxkxk",
      ".kxxxxxxk.",
      ".kxxxxxxk.",
      ".kkxkkxkk.",
      "..k.kk.k..",
      "..k....k..",
    ],
  },

  skull: {
    rows: [
      "..kkkkkk..",
      ".kwwwwwwk.",
      "kwwwwwwwwk",
      "kwwkkkkwwk",
      "kwwkkkkwwk",
      "kwwwwwwwwk",
      ".kwwkkwwk.",
      "..kwwwwk..",
      "..kwwwwk..",
      "..kkkkkk..",
      "..........",
    ],
  },

  heart: {
    rows: [
      ".kkk.kkk.",
      "krrrkrrrk",
      "krrrrrrrk",
      "krrrrrrrk",
      ".krrrrrk.",
      "..krrrk..",
      "...krk...",
      "....k....",
    ],
  },
};
