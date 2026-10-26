import { C, W, H, fill, text, textCenter, panel, line } from "../engine/gfx.js";
import { clamp, easeOutCubic, pulse } from "../engine/utils.js";

export default {
  id: "ladder",
  title: "ЛЕСТНИЦА",
  hint: "Выбери лестницу и доберись до выхода.",
  input: "sides",
  duration: 6.2,

  create(api) {
    const ladders = [74, 166];
    const bottomY = 282;
    const topY = 88;

    let t = 0;
    let state = "wait";
    let side = 0;
    let climbT = 0;
    let fallT = 0;
    let reported = false;
    let playerX = 120;
    let playerY = bottomY;

    function choose(dir) {
      if (state !== "wait") return;
      side = dir;
      playerX = dir < 0 ? ladders[0] : ladders[1];
      playerY = bottomY;
      state = "climb";
      climbT = 0;
      api.audio.ui();
    }

    function drawClimber(ctx, x, y, phase, falling) {
      ctx.save();
      if (falling) {
        ctx.translate(x, y);
        ctx.rotate(clamp(fallT, 0, 0.8) * 4.5);
        x = 0;
        y = 0;
      }

      const step = Math.sin(phase * 15);
      fill(ctx, x - 7, y - 20, 14, 17, "#e8b13d");
      fill(ctx, x - 7, y - 8, 14, 5, "#2d6f8c");
      fill(ctx, x - 5, y - 30, 10, 11, "#f0b98b");
      fill(ctx, x - 7, y - 33, 14, 4, "#d64c4c");
      fill(ctx, x - 3, y - 26, 2, 2, C.ink);
      fill(ctx, x + 2, y - 26, 2, 2, C.ink);
      fill(ctx, x - 5, y - 3, 4, 11 + step * 2, "#263a63");
      fill(ctx, x + 1, y - 3, 4, 11 - step * 2, "#263a63");
      fill(ctx, x - 9, y - 18 + step * 3, 3, 12, "#f0b98b");
      fill(ctx, x + 6, y - 18 - step * 3, 3, 12, "#f0b98b");
      ctx.restore();
    }

    function drawLadder(ctx, x, chosen) {
      const rail = chosen && state !== "wait" ? "#d7a64a" : "#9b8052";
      fill(ctx, x - 16, 72, 5, 224, rail);
      fill(ctx, x + 11, 72, 5, 224, rail);
      fill(ctx, x - 16, 72, 2, 224, "rgba(255,246,229,0.25)");
      fill(ctx, x + 14, 72, 2, 224, "rgba(0,0,0,0.28)");

      for (let y = 84; y < 294; y += 18) {
        const missing = chosen && state !== "wait" && y < 102;
        if (missing) continue;
        fill(ctx, x - 14, y, 28, 4, "#c2a267");
        fill(ctx, x - 14, y + 3, 28, 1, "rgba(0,0,0,0.32)");
      }

      if (chosen && state !== "wait") {
        fill(ctx, x - 20, 84, 40, 4, "rgba(255,85,119,0.18)");
      }
    }

    return {
      update(dt) {
        t += dt;

        if (state === "wait" && t > 3.4) choose(Math.random() < 0.5 ? -1 : 1);

        if (state === "climb") {
          climbT += dt;
          const p = clamp(climbT / 1.35, 0, 1);
          playerY = bottomY - (bottomY - topY) * easeOutCubic(p);

          if (p >= 1) {
            state = "fall";
            fallT = 0;
            api.audio.crash();
          }
        }

        if (state === "fall") {
          fallT += dt;
          playerY += fallT * fallT * 520;
          if (fallT > 0.9 && !reported) {
            reported = true;
            api.lose("Верхняя перекладина была нарисована. Падение — настоящее.");
          }
        }
      },

      press(action) {
        if (action.type === "left") choose(-1);
        if (action.type === "right") choose(1);
      },

      draw(ctx) {
        fill(ctx, 0, 0, W, H, "#1c1c32");
        fill(ctx, 0, 0, W, 128, "#2a2948");

        for (let y = 128; y < 320; y += 16) {
          for (let x = (y / 16) % 2 ? -16 : 0; x < W; x += 32) {
            fill(ctx, x + 1, y + 1, 29, 13, "#302c4a");
            fill(ctx, x + 1, y + 1, 29, 1, "rgba(255,255,255,0.035)");
          }
        }

        fill(ctx, 22, 122, 196, 7, "#141327");
        fill(ctx, 28, 129, 184, 4, "#40395e");

        for (let i = 0; i < 6; i += 1) {
          const x = i % 2 ? 204 : 22;
          const y = 150 + Math.floor(i / 2) * 54;
          fill(ctx, x, y, 15, 23, "#11142a");
          fill(ctx, x + 2, y + 2, 11, 19, i === 1 || i === 4 ? "#e7b958" : "#35456c");
          fill(ctx, x + 5, y + 5, 5, 6, "rgba(255,246,229,0.18)");
        }

        for (const x of ladders) drawLadder(ctx, x, side < 0 ? x === ladders[0] : x === ladders[1]);

        panel(ctx, 78, 42, 84, 27, "#2a2246");
        fill(ctx, 78, 42, 84, 3, C.mint);
        textCenter(ctx, "ВЫХОД", 120, 46, { size: 11, color: C.paper });
        fill(ctx, 91, 60, 58, 2, "rgba(89,198,181,0.55)");

        drawClimber(ctx, playerX, playerY, climbT, state === "fall");

        if (state === "wait") {
          const blink = pulse(t, 7) > 0.3;
          if (blink) {
            textCenter(ctx, "◀", 74, 300, { size: 13, color: C.amber });
            textCenter(ctx, "▶", 166, 300, { size: 13, color: C.amber });
          }
        }

        if (state === "fall") {
          for (let i = 0; i < 7; i += 1) {
            const angle = (i / 7) * Math.PI * 2 + fallT * 4;
            fill(
              ctx,
              playerX + Math.cos(angle) * (10 + fallT * 30),
              playerY + Math.sin(angle) * (10 + fallT * 24),
              2,
              2,
              i % 2 ? C.paper : C.pink
            );
          }
        }

        panel(ctx, 10, 8, 220, 28, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.amber);
        textCenter(ctx, "ЛЕСТНИЦА", 120, 12, { size: 12, color: C.paper });
        text(
          ctx,
          state === "wait" ? "◀ ВЫБЕРИ ЛЕСТНИЦУ ▶" : state === "climb" ? "ПОЧТИ НАВЕРХУ..." : "ПЕРЕКЛАДИНА НЕ ВЫДЕРЖАЛА",
          120,
          25,
          { size: 8, color: state === "wait" ? "#d7cdf0" : "#ffb3c1", align: "center" }
        );

        if (state === "wait") {
          line(ctx, 74, 292, 166, 292, "rgba(255,213,71,0.14)", 1);
        }
      },
    };
  },
};
