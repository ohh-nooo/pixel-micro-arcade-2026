import { C, fill, text, textCenter, line, panel, circle } from "../engine/gfx.js";
import { drawSprite } from "../engine/assets.js";
import { clamp, easeOutCubic } from "../engine/utils.js";

export default {
  id: "penalty",
  title: "ПЕНАЛЬТИ",
  hint: "Забей гол. Вратарь против. И не один.",
  input: "tap",
  duration: 5.5,

  create(api) {
    const goalLeft = 36;
    const goalRight = 204;
    const goalTop = 68;
    const goalBottom = 140;
    const ballStart = { x: 120, y: 262 };

    let t = 0;
    let state = "aim";
    let shotT = 0;
    let aim = 120;
    let keeperShift = 0;
    let reported = false;
    let saved = false;

    function takeShot() {
      aim = clamp(120 + Math.sin(t * 2.05) * 72, goalLeft + 14, goalRight - 14);
      state = "shoot";
      shotT = 0;
      saved = false;
      api.audio.thud();
    }

    function ballPosition() {
      if (shotT < 0.55) {
        const p = clamp(shotT / 0.55, 0, 1);
        const e = easeOutCubic(p);
        return {
          x: ballStart.x + (aim - ballStart.x) * e,
          y: ballStart.y + (goalBottom - 22 - ballStart.y) * e - Math.sin(p * Math.PI) * 18,
          scale: 3 - p * 1.35,
        };
      }

      const p = clamp((shotT - 0.55) / 0.65, 0, 1);
      return {
        x: aim + (105 - aim) * p,
        y: goalBottom - 22 + (ballStart.y + 16 - (goalBottom - 22)) * p,
        scale: 1.65 + p * 1.35,
      };
    }

    return {
      update(dt) {
        t += dt;

        if (state === "aim") {
          keeperShift = Math.sin(t * 1.7) * 12;
          if (t > 3.8) takeShot();
          return;
        }

        shotT += dt;

        if (!saved && shotT >= 0.55) {
          saved = true;
          api.audio.crash();
        }

        if (shotT > 1.5 && !reported) {
          reported = true;
          api.lose("Вратарей оказалось трое. Гол не предусмотрен.");
        }
      },

      press(action) {
        if (state !== "aim" || action.type !== "tap") return;
        takeShot();
      },

      draw(ctx) {
        fill(ctx, 0, 0, 240, 320, "#0f1428");

        for (let i = 0; i < 40; i += 1) {
          const x = (i * 53 + 7) % 240;
          const y = 10 + ((i * 29 + 11) % 48);
          const colors = ["#ffd447", "#ff5577", "#59c6b5", "#b0b6c8", "#a463e8"];
          fill(ctx, x, y, 3, 3, colors[i % colors.length]);
        }

        fill(ctx, 0, 60, 240, 8, "#0a0d18");
        fill(ctx, 0, 136, 240, 184, "#2c6b3f");
        for (let i = 0; i < 9; i += 1) {
          if (i % 2 === 0) fill(ctx, 0, 136 + i * 21, 240, 21, "#316f43");
        }

        line(ctx, 20, 136, 20, 320, "rgba(255,255,255,0.22)", 2);
        line(ctx, 220, 136, 220, 320, "rgba(255,255,255,0.22)", 2);
        line(ctx, 20, 240, 220, 240, "rgba(255,255,255,0.18)", 2);

        fill(ctx, goalLeft - 6, goalTop - 6, goalRight - goalLeft + 12, 6, "#fff6e5");
        fill(ctx, goalLeft - 6, goalTop, 6, goalBottom - goalTop + 8, "#fff6e5");
        fill(ctx, goalRight, goalTop, 6, goalBottom - goalTop + 8, "#fff6e5");

        ctx.save();
        ctx.beginPath();
        ctx.rect(goalLeft, goalTop, goalRight - goalLeft, goalBottom - goalTop);
        ctx.clip();
        fill(ctx, goalLeft, goalTop, goalRight - goalLeft, goalBottom - goalTop, "rgba(15,20,40,0.55)");
        for (let x = goalLeft; x < goalRight; x += 12) {
          fill(ctx, x, goalTop, 1, goalBottom - goalTop, "rgba(255,246,229,0.22)");
        }
        for (let y = goalTop; y < goalBottom; y += 12) {
          fill(ctx, goalLeft, y, goalRight - goalLeft, 1, "rgba(255,246,229,0.22)");
        }
        ctx.restore();

        fill(ctx, 160, 60, 3, 8, "#fff6e5");
        fill(ctx, 77, 60, 3, 8, "#fff6e5");

        const keeperX = state === "aim" ? 120 + keeperShift : aim;

        if (state === "aim") {
          drawSprite(ctx, "keeper", keeperX - 13, goalBottom - 39 + Math.sin(t * 3) * 1, {
            scale: 2.6,
            paint: "#59c6b5",
          });
        } else {
          const clones = [aim - 46, aim, aim + 46].map((x) => clamp(x, goalLeft + 14, goalRight - 14));
          clones.forEach((x, i) => {
            const hop = Math.sin(clamp(shotT / 0.55, 0, 1) * Math.PI) * 10;
            drawSprite(ctx, "keeper", x - 13, goalBottom - 39 - hop, {
              scale: 2.6,
              paint: i === 1 ? "#59c6b5" : "#4a9f94",
            });
          });
        }

        if (state === "aim") {
          const reticleX = clamp(120 + Math.sin(t * 2.05) * 72, goalLeft + 14, goalRight - 14);
          const blink = Math.sin(t * 9) > 0;
          if (blink) {
            fill(ctx, reticleX - 9, goalTop + 28, 18, 2, C.amber);
            fill(ctx, reticleX - 1, goalTop + 20, 2, 18, C.amber);
          }
          circle(ctx, reticleX, goalTop + 29, 2, C.amber);
        }

        if (state === "aim") {
          drawSprite(ctx, "ball", ballStart.x - 9, ballStart.y, { scale: 3 });
          fill(ctx, ballStart.x - 12, ballStart.y + 18, 24, 4, "rgba(0,0,0,0.22)");
        } else {
          const pos = ballPosition();
          drawSprite(ctx, "ball", pos.x - 9 * (pos.scale / 3), pos.y, { scale: pos.scale });
          for (let i = 0; i < 2; i += 1) {
            fill(ctx, pos.x - 4 + i * 10, pos.y + 30 + i * 6, 3, 3, "rgba(255,246,229,0.3)");
          }
        }

        if (saved) {
          const p = clamp((shotT - 0.55) / 0.35, 0, 1);
          textCenter(ctx, "СЕЙВ!", 120, 158, {
            size: 26,
            color: C.pink,
            alpha: 1 - p * 0.35,
            shadowColor: "#100c1f",
          });
          for (let i = 0; i < 8; i += 1) {
            const angle = (i / 8) * Math.PI * 2;
            fill(
              ctx,
              aim + Math.cos(angle) * (15 + p * 22),
              goalBottom - 24 + Math.sin(angle) * (10 + p * 16),
              3,
              3,
              C.paper
            );
          }
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.mint);
        textCenter(ctx, "ПЕНАЛЬТИ", 120, 13, { size: 12, color: C.paper });
        text(ctx, "0 : 0", 19, 29, { size: 10, color: "#d7cdf0" });
        text(ctx, "ТАП — УДАР", 221, 29, { size: 9, color: "#d7cdf0", align: "right" });

        if (state === "aim") {
          textCenter(ctx, "ЦЕЛЬСЯ", 120, 293, {
            size: 11,
            color: "rgba(255,246,229,0.65)",
          });
        }
      },
    };
  },
};
