import { PALETTE, SPRITES } from "../art.js";

let palette = { ...PALETTE };
let manifest = { sprites: {} };
let ready = false;

const proceduralCache = new Map();
const overrides = new Map();

function dimensionsOf(definition) {
  const rows = definition.rows;
  return {
    w: Math.max(...rows.map((row) => row.length)),
    h: rows.length,
  };
}

function makeProceduralCanvas(key, paint) {
  const definition = SPRITES[key];
  if (!definition) return null;

  const { w, h } = dimensionsOf(definition);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  const colors = paint ? { ...palette, x: paint } : palette;

  for (let y = 0; y < definition.rows.length; y += 1) {
    const row = definition.rows[y];
    for (let x = 0; x < row.length; x += 1) {
      const char = row[x];
      if (char === "." || char === " ") continue;
      const color = colors[char];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return canvas;
}

function getProcedural(key, paint) {
  const cacheKey = `${key}|${paint ?? ""}`;
  if (!proceduralCache.has(cacheKey)) {
    const canvas = makeProceduralCanvas(key, paint);
    if (!canvas) return null;
    proceduralCache.set(cacheKey, canvas);
  }
  return proceduralCache.get(cacheKey);
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export async function initAssets() {
  if (ready) return;
  ready = true;

  const manifestUrl = new URL(`${import.meta.env.BASE_URL}assets/manifest.json`, document.baseURI);

  try {
    const response = await fetch(manifestUrl, { cache: "no-cache" });
    if (response.ok) manifest = await response.json();
  } catch {
    // No manifest is fine: built-in procedural art is used.
  }

  if (manifest.palette && typeof manifest.palette === "object") {
    palette = { ...palette, ...manifest.palette };
  }

  proceduralCache.clear();

  const entries = Object.entries(manifest.sprites ?? {});
  await Promise.all(
    entries.map(async ([key, value]) => {
      const entry = typeof value === "string" ? { src: value } : value;
      if (!entry || !entry.src) return;

      const url = new URL(entry.src, manifestUrl);
      const image = await loadImage(url.href);
      if (!image) {
        console.warn(`[assets] Could not load override for "${key}": ${entry.src}`);
        return;
      }

      const base = SPRITES[key] ? dimensionsOf(SPRITES[key]) : null;
      const w = entry.width ?? base?.w ?? image.naturalWidth;
      const h = entry.height ?? base?.h ?? image.naturalHeight;
      overrides.set(key, { image, w, h });
    })
  );
}

export function spriteSize(key) {
  const override = overrides.get(key);
  if (override) return { w: override.w, h: override.h };
  if (SPRITES[key]) return dimensionsOf(SPRITES[key]);
  return { w: 8, h: 8 };
}

export function spritePalette() {
  return { ...palette };
}

export function drawSprite(ctx, key, x, y, opts = {}) {
  const { scale = 1, paint = null, flipX = false, alpha = 1 } = opts;
  const override = overrides.get(key);
  const source = override?.image ?? getProcedural(key, paint);
  const { w: baseW, h: baseH } = spriteSize(key);

  const w = Math.round(baseW * scale);
  const h = Math.round(baseH * scale);

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = false;

  const dx = Math.round(x);
  const dy = Math.round(y);

  if (flipX) {
    ctx.translate(dx + w, dy);
    ctx.scale(-1, 1);
    if (source) ctx.drawImage(source, 0, 0, w, h);
    else drawMissing(ctx, 0, 0, w, h);
  } else {
    if (source) ctx.drawImage(source, dx, dy, w, h);
    else drawMissing(ctx, dx, dy, w, h);
  }

  ctx.restore();
}

export function drawSpriteCentered(ctx, key, cx, cy, opts = {}) {
  const { scale = 1 } = opts;
  const { w, h } = spriteSize(key);
  drawSprite(ctx, key, cx - (w * scale) / 2, cy - (h * scale) / 2, opts);
}

function drawMissing(ctx, x, y, w, h) {
  ctx.fillStyle = "#ff00aa";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#161222";
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y + h - 2, w, 2);
}
