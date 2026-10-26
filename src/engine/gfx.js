export const W = 240;
export const H = 320;

export const C = {
  ink: "#161222",
  inkSoft: "#241d3d",
  paper: "#fff6e5",
  amber: "#ffd447",
  red: "#e8473f",
  pink: "#ff5577",
  mint: "#59c6b5",
  blue: "#3b7ed6",
  green: "#4fc45c",
  white: "#ffffff",
  shadow: "rgba(8, 5, 16, 0.55)",
};

export function clear(ctx, color = C.ink) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
}

export function fill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function line(ctx, x1, y1, x2, y2, color = C.paper, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5);
  ctx.lineTo(Math.round(x2) + 0.5, Math.round(y2) + 0.5);
  ctx.stroke();
}

export function circle(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function box(ctx, x, y, w, h, bg = C.inkSoft, border = C.ink, borderWidth = 2) {
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);
  fill(ctx, x, y, w, h, border);
  fill(ctx, x + borderWidth, y + borderWidth, w - borderWidth * 2, h - borderWidth * 2, bg);
}

export function panel(ctx, x, y, w, h, bg = C.inkSoft) {
  fill(ctx, x + 3, y + 4, w, h, "rgba(0,0,0,0.35)");
  box(ctx, x, y, w, h, bg, C.ink, 2);
  line(ctx, x + 2, y + 2, x + w - 3, y + 2, "rgba(255,255,255,0.16)");
}

export function setFont(ctx, size, weight = 700) {
  ctx.font = `${weight} ${Math.round(size)}px "Pixelify Sans", "Courier New", monospace`;
}

export function measure(ctx, str, size, weight = 700) {
  setFont(ctx, size, weight);
  return ctx.measureText(str).width;
}

export function fitSize(ctx, str, maxWidth, maxSize, weight = 700) {
  let size = maxSize;
  while (size > 6 && measure(ctx, str, size, weight) > maxWidth) size -= 1;
  return size;
}

export function text(ctx, str, x, y, opts = {}) {
  const {
    size = 10,
    weight = 700,
    color = C.paper,
    align = "left",
    baseline = "top",
    shadow = true,
    shadowColor = C.ink,
    alpha = 1,
    outline = null,
  } = opts;

  ctx.save();
  ctx.globalAlpha *= alpha;
  setFont(ctx, size, weight);
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(2, Math.round(size / 5));
    ctx.lineJoin = "round";
    ctx.strokeText(str, Math.round(x), Math.round(y));
  }

  if (shadow) {
    ctx.fillStyle = shadowColor;
    ctx.fillText(str, Math.round(x) + Math.max(1, Math.round(size / 12)), Math.round(y) + Math.max(1, Math.round(size / 9)));
  }

  ctx.fillStyle = color;
  ctx.fillText(str, Math.round(x), Math.round(y));
  ctx.restore();
}

export function textCenter(ctx, str, x, y, opts = {}) {
  text(ctx, str, x, y, { ...opts, align: "center" });
}

export function wrapText(ctx, str, maxWidth, size, weight = 600) {
  setFont(ctx, size, weight);
  const words = String(str).split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(ctx, candidate, size, weight) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (measure(ctx, word, size, weight) > maxWidth) {
        let chunk = "";
        for (const char of word) {
          if (measure(ctx, chunk + char, size, weight) > maxWidth) {
            lines.push(chunk);
            chunk = char;
          } else {
            chunk += char;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function paragraph(ctx, str, x, y, maxWidth, opts = {}) {
  const { size = 10, weight = 600, lineHeight = size + 4, align = "left", ...rest } = opts;
  const lines = wrapText(ctx, str, maxWidth, size, weight);
  lines.forEach((lineText, i) => {
    text(ctx, lineText, x, y + i * lineHeight, { size, weight, align, ...rest });
  });
  return lines.length * lineHeight;
}

export function stripes(ctx, color = "rgba(255,255,255,0.035)", step = 10, w = W, h = H, x = 0, y = 0) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  for (let i = -h; i < w + h; i += step) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + h);
    ctx.lineTo(x + i + h, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function grid(ctx, x, y, w, h, step, color = "rgba(255,255,255,0.06)") {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let gx = x; gx <= x + w; gx += step) {
    ctx.beginPath();
    ctx.moveTo(Math.round(gx) + 0.5, y);
    ctx.lineTo(Math.round(gx) + 0.5, y + h);
    ctx.stroke();
  }
  for (let gy = y; gy <= y + h; gy += step) {
    ctx.beginPath();
    ctx.moveTo(x, Math.round(gy) + 0.5);
    ctx.lineTo(x + w, Math.round(gy) + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

export function pixelStar(ctx, cx, cy, r, color = C.amber) {
  fill(ctx, cx - 1, cy - r, 2, r * 2, color);
  fill(ctx, cx - r, cy - 1, r * 2, 2, color);
  fill(ctx, cx - 2, cy - 2, 4, 4, color);
}

export function sparkle(ctx, cx, cy, size, color = C.amber) {
  const s = Math.max(1, Math.round(size));
  fill(ctx, cx - s, cy, s * 2 + 1, 1, color);
  fill(ctx, cx, cy - s, 1, s * 2 + 1, color);
  fill(ctx, cx - 1, cy - 1, 3, 3, color);
}

export function badge(ctx, str, x, y, opts = {}) {
  const { size = 9, bg = C.amber, color = C.ink, padX = 5, padY = 3, align = "left" } = opts;
  const tw = measure(ctx, str, size, 700);
  const w = Math.ceil(tw) + padX * 2;
  const h = Math.ceil(size) + padY * 2;
  const dx = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  fill(ctx, dx + 2, y + 2, w, h, "rgba(0,0,0,0.4)");
  fill(ctx, dx, y, w, h, bg);
  text(ctx, str, dx + padX, y + padY - 1, { size, color, shadow: false });
  return { x: dx, y, w, h };
}

export function arrow(ctx, cx, cy, dir, size = 8, color = C.paper) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  if (dir === "left") {
    ctx.moveTo(cx - size, cy);
    ctx.lineTo(cx + size, cy - size);
    ctx.lineTo(cx + size, cy + size);
  } else {
    ctx.moveTo(cx + size, cy);
    ctx.lineTo(cx - size, cy - size);
    ctx.lineTo(cx - size, cy + size);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function controlsBadge(ctx, mode, x, y, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (mode === "sides") {
    badge(ctx, "◀  ▶", x, y, { size: 11, bg: C.paper, color: C.ink });
  } else {
    badge(ctx, "ТАП", x, y, { size: 11, bg: C.amber, color: C.ink });
  }
  ctx.restore();
}

export function shake(ctx, amount, offset) {
  if (amount <= 0) return;
  const a = Math.ceil(amount);
  ctx.translate(Math.round((Math.random() * 2 - 1) * a), Math.round((Math.random() * 2 - 1) * a));
}
