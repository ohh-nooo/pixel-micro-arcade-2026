import { C, fill, textCenter, panel, line } from "../engine/gfx.js";
import { drawSprite } from "../engine/assets.js";
import { clamp, easeInOutQuad, pulse } from "../engine/utils.js";

export default {
  id: "worldmap",
  title: "КАРТА МИРА",
  hint: "Выбери, куда плыть. Карта уже врёт.",
  input: "tap",
  duration: 6,

  create(api) {
    const markers = [
      { x: 68, y: 106, label: "А", name: "ТУПИК" },
      { x: 178, y: 92, label: "Б", name: "ОКЕАН" },
      { x: 182, y: 222, label: "В", name: "НИГДЕ" },
    ];
    const home = { x: 58, y: 264 };

    let t = 0;
    let state = "wait";
    let sailT = 0;
    let sinkT = 0;
    let chosen = null;
    let reported = false;
    let tapPoint = null;
    let tapFlash = 0;

    const islands = [
      [
        [48, 92, 30, 8],
        [44, 100, 44, 14],
        [54, 114, 24, 8],
        [62, 122, 12, 5],
      ],
      [
        [160, 76, 28, 8],
        [154, 84, 46, 18],
        [164, 102, 26, 8],
        [178, 110, 12, 5],
      ],
      [
        [158, 206, 34, 8],
        [152, 214, 48, 20],
        [166, 234, 24, 8],
        [174, 242, 10, 5],
      ],
      [
        [24, 250, 48, 10],
        [20, 260, 58, 16],
        [34, 276, 34, 10],
      ],
    ];

    function drawIslands(ctx) {
      islands.forEach((island, index) => {
        island.forEach(([x, y, w, h], i) => {
          fill(ctx, x, y, w, h, index === 3 && i > 0 ? "#8a7a58" : "#6f9b5a");
          fill(ctx, x, y, w, 3, "#8fbd6e");
          fill(ctx, x, y + h - 2, w, 2, "#4f7542");
        });

        if (index < 3) {
          const base = island[1];
          const treeX = base[0] + 8;
          const treeY = base[1] + 2;
          fill(ctx, treeX, treeY, 2, 5, "#3f6137");
          fill(ctx, treeX - 2, treeY - 2, 6, 4, "#4f7542");
        }
      });
    }

    function drawRoute(ctx, target, progress = 1, highlight = false) {
      const dx = target.x - home.x;
      const dy = target.y - home.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.floor(dist / 10);
      for (let i = 0; i <= steps; i += 1) {
        const p = i / Math.max(1, steps);
        if (p > progress) break;
        const wobble = Math.sin(p * 9 + t * 1.5) * 3;
        const x = home.x + dx * p + (-dy / dist) * wobble;
        const y = home.y + dy * p + (dx / dist) * wobble;
        fill(ctx, x, y, highlight ? 3 : 2, highlight ? 3 : 2, highlight ? C.amber : "rgba(255,246,229,0.4)");
      }
    }

    function drawMarker(ctx, marker, selected) {
      const blink = selected || pulse(t * 2 + marker.x, 3) > 0.25;
      const s = selected ? 6 : 4;
      line(ctx, marker.x - s, marker.y - s, marker.x + s, marker.y + s, blink ? C.amber : "#d9cba9", 2);
      line(ctx, marker.x + s, marker.y - s, marker.x - s, marker.y + s, blink ? C.amber : "#d9cba9", 2);
      fill(ctx, marker.x - 1, marker.y - 1, 3, 3, C.ink);
      textCenter(ctx, marker.label, marker.x, marker.y - 18, {
        size: 12,
        color: selected ? C.amber : C.paper,
        shadowColor: "#1a2c34",
      });
      textCenter(ctx, marker.name, marker.x, marker.y + 10, {
        size: 9,
        color: selected ? "#ffe28c" : "rgba(255,246,229,0.78)",
        shadowColor: "#1a2c34",
      });
    }

    function drawCompass(ctx) {
      const cx = 205;
      const cy = 64;
      ctx.save();
      ctx.globalAlpha = 0.95;
      fill(ctx, cx - 19, cy - 19, 38, 38, "#1a2c34");
      fill(ctx, cx - 17, cy - 17, 34, 34, "#e6d6b3");
      line(ctx, cx - 17, cy, cx + 17, cy, "rgba(22,18,34,0.25)");
      line(ctx, cx, cy - 17, cx, cy + 17, "rgba(22,18,34,0.25)");

      let angle = -0.6;
      if (state === "sail") angle = -0.6 + sailT * 9;
      if (state === "sink") angle = Math.PI / 2;

      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = C.red;
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(4, 5);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.beginPath();
      ctx.moveTo(0, 13);
      ctx.lineTo(3, 5);
      ctx.lineTo(-3, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      textCenter(ctx, "N", cx, cy - 30, { size: 9, color: "#e6d6b3", shadow: false });
      if (state !== "wait") {
        fill(ctx, cx - 32, cy + 18, 64, 13, "rgba(22,18,34,0.82)");
        textCenter(ctx, "ПЕРЕВЁРНУТО", cx, cy + 21, { size: 8, color: "#ffb3c1", shadow: false });
      }
    }

    function startSail(target) {
      chosen = target;
      state = "sail";
      sailT = 0;
      api.audio.select();
    }

    return {
      update(dt) {
        t += dt;
        tapFlash = Math.max(0, tapFlash - dt);

        if (state === "wait") {
          if (t > 4.1) startSail(markers[1]);
          return;
        }

        if (state === "sail") {
          sailT += dt;
          if (sailT >= 1.35) {
            state = "sink";
            sinkT = 0;
            api.audio.thud();
          }
          return;
        }

        if (state === "sink") {
          sinkT += dt;
          if (sinkT > 0.9 && !reported) {
            reported = true;
            api.lose("Карта была перевёрнута. Пункт назначения — никуда.");
          }
        }
      },

      press(action) {
        if (state !== "wait" || action.type !== "tap") return;

        tapPoint = { x: action.x, y: action.y };
        tapFlash = 0.5;

        let nearest = markers[0];
        let best = Infinity;
        for (const marker of markers) {
          const d = Math.hypot(marker.x - action.x, marker.y - action.y);
          if (d < best) {
            best = d;
            nearest = marker;
          }
        }
        startSail(nearest);
      },

      draw(ctx) {
        fill(ctx, 0, 0, 240, 320, "#1d3a5c");

        for (let y = 44; y < 320; y += 20) {
          for (let x = (y / 20) % 2 ? 6 : 0; x < 240; x += 18) {
            fill(ctx, x + ((t * 4) % 18), y, 3, 1, "rgba(189,231,255,0.12)");
          }
        }

        for (let x = 0; x < 240; x += 40) {
          fill(ctx, x + (t * 2) % 40, 44, 1, 276, "rgba(189,231,255,0.055)");
        }
        for (let y = 44; y < 320; y += 40) {
          fill(ctx, 0, y, 240, 1, "rgba(189,231,255,0.055)");
        }

        drawIslands(ctx);

        textCenter(ctx, "ДОМ", home.x, home.y + 18, { size: 9, color: "#f0e2c2", shadowColor: "#1a2c34" });

        for (const marker of markers) {
          drawRoute(ctx, marker, 1, chosen === marker);
        }

        for (const marker of markers) {
          drawMarker(ctx, marker, chosen === marker);
        }

        if (state === "wait") {
          drawSprite(ctx, "ship", home.x - 11, home.y - 18 + Math.sin(t * 2) * 2, { scale: 2.2 });
        }

        if (state !== "wait" && chosen) {
          const p = clamp(sailT / 1.35, 0, 1);
          const e = easeInOutQuad(p);
          const dx = chosen.x - home.x;
          const dy = chosen.y - home.y;
          const dist = Math.hypot(dx, dy);
          const wobble = Math.sin(e * 9) * 8;
          const sx = home.x + dx * e + (-dy / dist) * wobble;
          const sy = home.y + dy * e + (dx / dist) * wobble;
          drawRoute(ctx, chosen, Math.min(1, e + 0.1), true);

          if (state === "sail") {
            drawSprite(ctx, "ship", sx - 11, sy - 18, { scale: 2.2, flipX: dx < 0 });
            for (let i = 1; i < 4; i += 1) {
              fill(ctx, sx - 11 - dx * 0.012 * i, sy - 2 - dy * 0.01 * i, 3, 3, "rgba(255,255,255,0.35)");
            }
          } else {
            const sink = clamp(sinkT / 0.9, 0, 1);
            const shrink = 2.2 * (1 - sink * 0.65);
            ctx.save();
            ctx.translate(sx, sy - 8 + sink * 14);
            ctx.rotate(sink * 2.6);
            drawSprite(ctx, "ship", -5 * shrink, -5.5 * shrink, { scale: shrink, alpha: 1 - sink * 0.4 });
            ctx.restore();

            for (let i = 0; i < 6; i += 1) {
              const radius = 8 + i * 6 + Math.sin(t * 5 + i) * 2;
              ctx.strokeStyle = i % 2 ? "rgba(189,231,255,0.55)" : "rgba(28,58,92,0.9)";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.ellipse(chosen.x, chosen.y + 6, radius, radius * 0.36, t * 2 + i, 0, Math.PI * 2);
              ctx.stroke();
            }
            fill(ctx, chosen.x - 5, chosen.y + 1, 10, 6, "#102033");
            textCenter(ctx, "БУЛЬ.", chosen.x, chosen.y - 28, { size: 11, color: C.paper });
          }
        }

        if (tapFlash > 0 && tapPoint) {
          const p = 1 - tapFlash / 0.5;
          ctx.strokeStyle = `rgba(255,213,71,${1 - p})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tapPoint.x, tapPoint.y, 4 + p * 18, 0, Math.PI * 2);
          ctx.stroke();
        }

        panel(ctx, 8, 9, 224, 30, "#2a2246");
        fill(ctx, 8, 9, 224, 3, C.mint);
        textCenter(
          ctx,
          state === "wait" ? "КУДА ПЛЫВЁМ? ТАПНИ ПО КАРТЕ" : state === "sail" ? "КУРС ПРОЛОЖЕН..." : "ОЙ.",
          120,
          18,
          { size: 11, color: state === "sink" ? C.pink : C.paper }
        );

        drawCompass(ctx);
      },
    };
  },
};
