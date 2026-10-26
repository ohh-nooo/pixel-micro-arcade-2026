import { C, fill, text, textCenter, panel } from "../engine/gfx.js";
import { drawSprite } from "../engine/assets.js";
import { clamp } from "../engine/utils.js";

export default {
  id: "whack",
  title: "КРОТ",
  hint: "Стукни крота. Он этого ждёт.",
  input: "tap",
  duration: 5,

  create(api) {
    const columns = [60, 120, 180];
    const rows = [132, 192, 252];
    const holes = [];
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        holes.push({ x: columns[c], y: rows[r], col: c, row: r });
      }
    }

    let t = 0;
    let moleIndex = 4;
    let moleTimer = 0;
    let molePop = 0;
    let state = "wait";
    let hitT = 0;
    let tappedHole = null;
    let exploded = false;
    let reported = false;

    function moveMole() {
      let next = moleIndex;
      while (next === moleIndex) next = api.randInt(0, holes.length - 1);
      moleIndex = next;
      molePop = 0;
    }

    function nearestHole(x, y) {
      let best = holes[0];
      let bestDist = Infinity;
      for (const hole of holes) {
        const d = (hole.x - x) ** 2 + (hole.y - y) ** 2;
        if (d < bestDist) {
          bestDist = d;
          best = hole;
        }
      }
      return best;
    }

    function startHit(hole) {
      state = "hit";
      hitT = 0;
      tappedHole = hole;
      api.audio.thud();
    }

    return {
      update(dt) {
        t += dt;

        if (state === "wait") {
          molePop = Math.min(1, molePop + dt * 9);
          moleTimer += dt;
          if (moleTimer > 0.9) {
            moleTimer = 0;
            moveMole();
            api.audio.tick();
          }
          if (t > 3.9) startHit(holes[moleIndex]);
          return;
        }

        hitT += dt;
        if (hitT >= 0.2 && !exploded) {
          exploded = true;
          api.audio.explode();
        }
        if (hitT > 1.0 && !reported) {
          reported = true;
          api.lose("Это была бомба. Крот оказался приманкой.");
        }
      },

      press(action) {
        if (state !== "wait" || action.type !== "tap") return;
        startHit(nearestHole(action.x, action.y));
      },

      draw(ctx) {
        fill(ctx, 0, 0, 240, 320, "#3c7c4c");

        for (let i = 0; i < 9; i += 1) {
          fill(ctx, (i * 47) % 240, (i * 83) % 320, 22, 3, "rgba(255,255,255,0.06)");
        }

        fill(ctx, 0, 300, 240, 20, "#8a5a3b");
        fill(ctx, 0, 300, 240, 3, "#b77f3f");

        drawFence(ctx);

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.amber);
        textCenter(ctx, "ТИР «УДАЧА»", 120, 13, { size: 13, color: C.amber });
        text(ctx, "СЧЁТ 000", 18, 29, { size: 9, color: "#d7cdf0" });
        text(ctx, "ЦЕЛЬ: КРОТ", 222, 29, { size: 9, color: "#ffb3c1", align: "right" });

        for (const hole of holes) {
          ctx.fillStyle = "#5d3b28";
          ctx.beginPath();
          ctx.ellipse(hole.x, hole.y + 6, 27, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#20140f";
          ctx.beginPath();
          ctx.ellipse(hole.x, hole.y + 5, 21, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          fill(ctx, hole.x - 24, hole.y - 2, 48, 2, "rgba(255,255,255,0.12)");
        }

        if (state === "wait") {
          const hole = holes[moleIndex];
          const bob = Math.sin(t * 5) * 1.5;
          const rise = (1 - molePop) * 16;
          fill(ctx, hole.x - 14, hole.y + 2, 28, 6, "rgba(0,0,0,0.25)");
          drawSprite(ctx, "mole", hole.x - 12, hole.y - 26 + rise + bob, { scale: 2.4 });
          if (molePop < 0.5) {
            fill(ctx, hole.x - 12, hole.y - 2, 24, 8, "#3c7c4c");
          }
        }

        if (state === "hit" && tappedHole) {
          const target = tappedHole;

          if (hitT < 0.24) {
            const drop = clamp(hitT / 0.18, 0, 1);
            ctx.save();
            ctx.translate(target.x, target.y - 52 + drop * 38);
            ctx.rotate(-0.5 + drop * 1.4);
            fill(ctx, -3, -6, 6, 30, "#8a5a3b");
            fill(ctx, -14, -12, 28, 13, "#b0b6c8");
            fill(ctx, -14, -12, 28, 3, "#e2e6ee");
            fill(ctx, -14, -2, 28, 3, "#6d7385");
            ctx.restore();
          }

          if (hitT >= 0.16) {
            bombBurst(ctx, target.x, target.y, hitT, t);
            for (const hole of holes) {
              drawSprite(ctx, "bomb", hole.x - 9, hole.y - 18 + Math.sin(t * 4 + hole.x) * 2, {
                scale: 1.7,
              });
            }
            if (hitT < 0.4) {
              ctx.fillStyle = `rgba(255,246,229,${Math.max(0, 0.6 - hitT)})`;
              ctx.fillRect(0, 0, 240, 320);
            }
            textCenter(ctx, "БУМ!", 120, 74, { size: 30, color: C.amber, shadowColor: "#4d131d" });
          }
        }

        if (state === "wait") {
          const arrow = Math.sin(t * 6) > 0;
          if (arrow) {
            textCenter(ctx, "СТУКНИ ЕГО!", 120, 90, { size: 12, color: "#ffe28c" });
          }
        }

        textCenter(ctx, "ТАП ГДЕ УГОДНО", 120, 308, { size: 9, color: "rgba(255,246,229,0.62)" });
      },
    };
  },
};

function drawFence(ctx) {
  for (let x = 0; x < 240; x += 24) {
    fill(ctx, x, 52, 3, 22, "#8a5a3b");
    fill(ctx, x, 56, 24, 3, "#b77f3f");
  }
  fill(ctx, 0, 58, 240, 2, "rgba(0,0,0,0.18)");
}

function bombBurst(ctx, x, y, hitT, t) {
  const p = clamp(hitT / 0.45, 0, 1);
  const radius = 10 + p * 58;
  for (let i = 0; i < 5; i += 1) {
    ctx.globalAlpha = 0.18 + (1 - p) * 0.3;
    ctx.fillStyle = i % 2 ? C.amber : "#f39433";
    ctx.beginPath();
    ctx.arc(x, y, radius * (1 - i * 0.16), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 9; i += 1) {
    const angle = (i / 9) * Math.PI * 2 + hitT * 4;
    const dist = 18 + p * 54;
    fill(ctx, x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 4, 4, i % 2 ? C.paper : C.amber);
  }

  fill(ctx, x - 14, y - 20, 28, 8, "rgba(60,50,50,0.35)");
  for (let i = 0; i < 3; i += 1) {
    const sx = x - 12 + i * 10;
    const sy = y - 30 - i * 5 + Math.sin(t * 5 + i) * 2;
    fill(ctx, sx, sy, 10, 8, "rgba(255,255,255,0.18)");
  }
}
