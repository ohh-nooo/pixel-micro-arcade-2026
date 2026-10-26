import {
  C,
  W,
  H,
  badge,
  box,
  fill,
  fitSize,
  panel,
  paragraph,
  stripes,
  text,
  textCenter,
  grid,
  sparkle,
} from "./gfx.js";
import { drawSprite, drawSpriteCentered } from "./assets.js";
import { clamp, easeOutCubic, pulse } from "./utils.js";

function flashIn(ctx, t, length = 0.16) {
  if (t >= length) return false;
  fill(ctx, 0, 0, W, H, `rgba(255,246,229,${1 - t / length})`);
  return true;
}

export function drawAttract(ctx, t, { gameCount = 8, maxLives = 3 } = {}) {
  fill(ctx, 0, 0, W, H, "#1a1430");

  const scroll = (t * 12) % 16;
  grid(ctx, 0, 0, W, H, 16, "rgba(255,255,255,0.035)");

  fill(ctx, 0, 0, W, 6, "#0d0a17");

  for (let i = 0; i < 12; i += 1) {
    const x = (i * 71 + 23) % W;
    const y = (i * 47 + 11 + scroll) % H;
    sparkle(ctx, x, y, 1, i % 3 === 0 ? "rgba(255,212,71,0.45)" : "rgba(255,255,255,0.18)");
  }

  const logoLines = ["NENORMOVA", "RETRO GAMER", "NASRAL 2026"];
  const logoSize = Math.min(32, ...logoLines.map((line) => fitSize(ctx, line, 218, 32)));
  logoLines.forEach((line, i) => {
    textCenter(ctx, line, W / 2, 26 + i * 36, {
      size: logoSize,
      color: i === 2 ? C.amber : C.paper,
      shadowColor: "#0b0814",
    });
  });

  textCenter(ctx, "СБОРНИК МИКРОИГР", W / 2, 144, { size: 12, color: "#d7cdf0" });
  textCenter(ctx, "ГДЕ ПОБЕДИТЬ НЕЛЬЗЯ", W / 2, 161, { size: 10, color: "#b3a5d6" });

  const bob = Math.sin(t * 2.4) * 2;
  const parade = [
    { key: "car", x: 34, y: 182, scale: 2, paint: "#e8473f" },
    { key: "runner", x: 68, y: 184, scale: 2, paint: "#3b7ed6" },
    { key: "star", x: 98, y: 187, scale: 2 },
    { key: "bomb", x: 126, y: 186, scale: 2 },
    { key: "mole", x: 154, y: 188, scale: 2 },
    { key: "skull", x: 186, y: 182, scale: 2 },
  ];

  parade.forEach((item, i) => {
    drawSprite(ctx, item.key, item.x, item.y + Math.sin(t * 3 + i * 0.7) * 2 + bob, {
      scale: item.scale,
      paint: item.paint ?? null,
    });
  });

  const blink = pulse(t, 5) > 0.35;
  const promptAlpha = blink ? 1 : 0.38;
  panel(ctx, 22, 222, 196, 50, "#2a2246");
  ctx.save();
  ctx.globalAlpha = promptAlpha;
  fill(ctx, 22, 222, 196, 3, C.amber);
  textCenter(ctx, "ТАП / ПРОБЕЛ", W / 2, 231, { size: 16, color: C.amber });
  textCenter(ctx, "НАЧАТЬ СМЕНУ", W / 2, 254, { size: 11, color: C.paper });
  ctx.restore();

  textCenter(ctx, `${gameCount} ИГР  ·  ${maxLives} ЖИЗНИ  ·  NO-WIN EDITION`, W / 2, 299, {
    size: 10,
    color: "#bcafd8",
  });
}

function controlInstruction(ctx, mode, y) {
  if (mode === "sides") {
    box(ctx, 36, y, 72, 34, "#312852", C.ink, 2);
    textCenter(ctx, "◀", 72, y + 2, { size: 16, color: C.paper });
    textCenter(ctx, "ВЛЕВО", 72, y + 21, { size: 10, color: "#e5dcff" });

    box(ctx, 132, y, 72, 34, "#312852", C.ink, 2);
    textCenter(ctx, "▶", 168, y + 2, { size: 16, color: C.paper });
    textCenter(ctx, "ВПРАВО", 168, y + 21, { size: 10, color: "#e5dcff" });
  } else {
    box(ctx, 54, y, 132, 34, "#3b315e", C.ink, 2);
    circleTapIcon(ctx, 74, y + 17);
    textCenter(ctx, "ТАП ГДЕ УГОДНО", 136, y + 11, { size: 11, color: C.paper });
  }
}

function circleTapIcon(ctx, x, y) {
  fill(ctx, x - 7, y - 7, 14, 14, "#4a3f70");
  fill(ctx, x - 5, y - 5, 10, 10, "#2a2246");
  fill(ctx, x - 2, y - 2, 4, 4, C.amber);
}

export function drawIntro(ctx, t, { game, index, count, duration, lives, maxLives }) {
  fill(ctx, 0, 0, W, H, "#241d3d");
  stripes(ctx, "rgba(255,255,255,0.035)", 12);
  fill(ctx, 0, 0, W, 5, "#0d0a17");
  fill(ctx, 0, H - 5, W, 5, "#0d0a17");

  const flash = flashIn(ctx, t, 0.12);
  if (flash) return;

  const enter = easeOutCubic(clamp(t / 0.28, 0, 1));
  const offset = (1 - enter) * 26;

  badge(ctx, "МИКРОИГРА", 16, 16, { size: 10, bg: C.mint, color: C.ink });
  badge(ctx, `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`, W - 16, 16, {
    size: 10,
    bg: C.paper,
    color: C.ink,
    align: "right",
  });

  textCenter(ctx, "ПРИГОТОВЬСЯ", W / 2, 68 + offset, { size: 12, color: C.amber });

  const titleSize = Math.min(38, fitSize(ctx, game.title, 212, 38));
  textCenter(ctx, game.title, W / 2, 86 + offset, {
    size: titleSize,
    color: C.paper,
    shadowColor: "#100c1f",
  });

  ctx.save();
  ctx.globalAlpha = enter;
  paragraph(ctx, game.hint, W / 2, 136 + offset, 196, {
    size: 12,
    weight: 600,
    align: "center",
    color: "#d7cdf0",
    lineHeight: 16,
  });

  textCenter(ctx, "УПРАВЛЕНИЕ", W / 2, 192 + offset, { size: 10, color: "#a395c8" });
  controlInstruction(ctx, game.input, 206 + offset);

  const pulseAlpha = 0.7 + pulse(t, 7) * 0.3;
  ctx.globalAlpha = pulseAlpha;
  badge(ctx, "ШАНС НА ПОБЕДУ: 0%", W / 2, 250 + offset, {
    size: 10,
    bg: "#6e2238",
    color: "#ffd9e1",
    align: "center",
  });
  ctx.restore();

  const progress = clamp(t / duration, 0, 1);
  fill(ctx, 24, 292, 192, 10, "#161222");
  fill(ctx, 27, 295, 186, 4, "#372c58");
  fill(ctx, 27, 295, Math.round(186 * progress), 4, C.amber);

  if (pulse(t, 10) > 0.55) {
    textCenter(ctx, "ПОЕХАЛИ...", W / 2, 274, { size: 10, color: "#a395c8" });
  }

  drawLives(ctx, { lives, maxLives, y: 307 });
}

export function drawPlayOverlay(ctx, { time, duration, goTime, lives, maxLives }) {
  const remaining = clamp(time / duration, 0, 1);
  const barW = Math.round(W * remaining);
  const critical = time < 1.5;
  const color = time < 1.5 ? (Math.sin(time * 18) > 0 ? "#ff5577" : "#ffd447") : time < duration * 0.5 ? C.amber : C.mint;

  fill(ctx, 0, 0, W, 5, "#0d0a17");
  fill(ctx, 0, 0, barW, 3, color);
  fill(ctx, 0, 3, barW, 1, "rgba(255,255,255,0.3)");
  if (critical && Math.sin(time * 18) > 0) {
    fill(ctx, 0, 0, W, 3, "rgba(255,85,119,0.35)");
  }

  if (goTime < 0.42) {
    const a = 1 - goTime / 0.42;
    ctx.save();
    ctx.globalAlpha = a;
    textCenter(ctx, "GO!", W / 2, 132, { size: 34, color: C.amber, shadowColor: "#0b0814" });
    ctx.restore();
  }

  drawLives(ctx, { lives, maxLives, y: 307 });
}

export function drawResult(ctx, t, { game, reason, duration = 2.35, lives, maxLives }) {
  fill(ctx, 0, 0, W, H, "rgba(9,5,16,0.76)");
  stripes(ctx, "rgba(255,85,119,0.05)", 14);
  fill(ctx, 0, 0, W, 5, "#0d0a17");
  fill(ctx, 0, H - 5, W, 5, "#0d0a17");

  const enter = easeOutCubic(clamp(t / 0.22, 0, 1));
  const scale = 0.82 + 0.18 * enter;
  const cardW = 214;
  const cardH = 198;
  const cardX = (W - cardW) / 2;
  const cardY = 56;

  ctx.save();
  ctx.translate(W / 2, cardY + cardH / 2);
  ctx.scale(scale, scale);
  ctx.translate(-W / 2, -(cardY + cardH / 2));

  panel(ctx, cardX, cardY, cardW, cardH, "#251c3d");
  fill(ctx, cardX, cardY, cardW, 4, C.red);

  badge(ctx, game.title, cardX + 9, cardY + 10, { size: 10, bg: "#392e58", color: "#e1d8ff" });

  ctx.save();
  ctx.translate(W / 2, cardY + 50);
  ctx.rotate(-0.055);
  textCenter(ctx, "ПРОИГРЫШ", 0, 0, { size: 36, color: C.pink, shadowColor: "#100c1f" });
  ctx.restore();

  paragraph(ctx, reason, W / 2, cardY + 90, 188, {
    size: 12,
    weight: 600,
    align: "center",
    color: "#f0e8ff",
    lineHeight: 16,
  });

  drawSpriteCentered(ctx, "skull", W / 2 - 46, cardY + 138, { scale: 1.8 });
  text(ctx, "0 ОЧКОВ", W / 2 - 26, cardY + 128, { size: 14, color: C.amber });
  text(ctx, "0 ПОБЕД", W / 2 - 26, cardY + 146, { size: 10, color: "#c4b7e0" });

  if (t > 0.55 && pulse(t, 6) > 0.4) {
    textCenter(ctx, "ТАП — ДАЛЬШЕ", W / 2, cardY + 170, { size: 11, color: "#c7bce0" });
  }

  ctx.restore();

  const progress = clamp(t / duration, 0, 1);
  fill(ctx, 28, 272, 184, 8, "#161222");
  fill(ctx, 31, 275, 178, 3, "#433560");
  fill(ctx, 31, 275, Math.round(178 * progress), 3, C.pink);

  textCenter(ctx, `ОСТАЛОСЬ ЖИЗНЕЙ: ${lives}`, W / 2, 287, { size: 10, color: "#b4a7d4" });
  drawLives(ctx, { lives, maxLives, y: 307 });
}

export function drawFinale(ctx, t, { maxLives = 3 } = {}) {
  fill(ctx, 0, 0, W, H, "#1b1329");
  stripes(ctx, "rgba(255,213,71,0.03)", 16);
  grid(ctx, 0, 0, W, H, 24, "rgba(255,255,255,0.025)");
  fill(ctx, 0, 0, W, 5, "#0d0a17");

  const colors = [C.pink, C.amber, C.mint, "#8f7bd4"];
  for (let i = 0; i < 34; i += 1) {
    const speed = 18 + (i % 5) * 7;
    const x = (i * 67 + t * (10 + (i % 3) * 9)) % (W + 20) - 10;
    const y = (i * 41 + t * speed) % (H + 20) - 10;
    fill(ctx, x, y, i % 4 === 0 ? 3 : 2, i % 3 === 0 ? 4 : 2, colors[i % colors.length]);
  }

  badge(ctx, "РЕЗУЛЬТАТ СМЕНЫ", W / 2, 18, { size: 10, bg: "#392e58", color: "#d7cdf0", align: "center" });

  textCenter(ctx, "СМЕНА", W / 2, 48, { size: 44, color: C.paper });
  textCenter(ctx, "ОКОНЧЕНА", W / 2, 90, { size: 38, color: C.amber });

  panel(ctx, 30, 138, 180, 82, "#251c3d");
  textCenter(ctx, `0 / ${maxLives}`, W / 2, 146, { size: 36, color: C.pink });
  textCenter(ctx, "ЖИЗНЕЙ ОСТАЛОСЬ", W / 2, 188, { size: 12, color: "#d0c5e8" });

  ctx.save();
  ctx.translate(190, 150);
  ctx.rotate(0.11);
  fill(ctx, -17, -17, 34, 34, "#3a2340");
  fill(ctx, -15, -15, 30, 30, C.pink);
  textCenter(ctx, "F", 0, -8, { size: 23, color: C.ink, shadow: false });
  ctx.restore();

  drawSpriteCentered(ctx, "skull", W / 2, 242, { scale: 2.1 });

  paragraph(ctx, "Все жизни закончились. Ни одна микрогигра не выиграна. Это мир, в котором победа не предусмотрена.", W / 2, 260, 194, {
    size: 10,
    weight: 600,
    align: "center",
    color: "#c4b7e0",
    lineHeight: 13,
  });

  if (t > 0.9) {
    const a = 0.55 + pulse(t, 5) * 0.45;
    ctx.save();
    ctx.globalAlpha = a;
    textCenter(ctx, "ТАП / ПРОБЕЛ — ЕЩЁ РАЗ", W / 2, 303, { size: 11, color: C.amber });
    ctx.restore();
  }
}

function drawHeart(ctx, x, y, color) {
  fill(ctx, x + 1, y, 2, 1, color);
  fill(ctx, x + 4, y, 2, 1, color);
  fill(ctx, x, y + 1, 7, 2, color);
  fill(ctx, x + 1, y + 3, 5, 1, color);
  fill(ctx, x + 2, y + 4, 3, 1, color);
  fill(ctx, x + 3, y + 5, 1, 1, color);
}

function drawLives(ctx, { lives = 0, maxLives = 3, x = W - 8, y = 307 } = {}) {
  const step = 9;
  const width = maxLives * step - 2;
  const left = x - width;

  fill(ctx, left - 3, y - 2, width + 6, 10, "rgba(13,10,23,0.68)");
  for (let i = 0; i < maxLives; i += 1) {
    drawHeart(ctx, left + i * step, y, i < lives ? C.pink : "#3a315e");
  }
}
