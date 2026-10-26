import { C, fill, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "parkour",
  title: "ПАРКУР",
  hint: "Разбегись и прыгни. Пропасть подождёт.",
  input: "sides",
  duration: 5.4,

  create(api) {
    let lean = 0;
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1.1,
      reason: "Пропасть оказалась шире прыжка. Как и ожидалось.",
      sound: "thud",
    });

    return {
      update(dt) {
        reaction.update(dt);
      },

      press(action) {
        if (reaction.started) return;
        if (action.type === "left") lean = -1;
        if (action.type === "right") lean = 1;
        if (action.type === "left" || action.type === "right") api.audio.ui();
      },

      draw(ctx) {
        const t = reaction.t;
        const p = reaction.p;

        const sky = ctx.createLinearGradient(0, 0, 0, 250);
        sky.addColorStop(0, "#25345c");
        sky.addColorStop(0.7, "#a85a64");
        sky.addColorStop(1, "#f2a45c");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 240, 250);

        circle(ctx, 188, 66, 18, "#ffdc7d");
        for (let i = 0; i < 7; i += 1) {
          const x = i * 42 - 14;
          const h = 42 + (i % 4) * 23;
          fill(ctx, x, 250 - h, 34, h, "#2e2b45");
          for (let y = 214 - h + 10; y < 242; y += 18) {
            fill(ctx, x + 5, y, 5, 7, "rgba(255,213,71,0.28)");
            fill(ctx, x + 20, y, 5, 7, "rgba(255,213,71,0.16)");
          }
        }

        fill(ctx, 0, 250, 96, 70, "#40394c");
        fill(ctx, 0, 250, 96, 4, "#6b6177");
        const gapStart = 96 + p * 34;
        fill(ctx, gapStart, 250, 240 - gapStart, 70, "#171426");
        fill(ctx, gapStart, 250, 5, 70, "#100e1a");
        fill(ctx, 154 + p * 12, 250, 86, 70, "#40394c");
        fill(ctx, 154 + p * 12, 250, 86, 4, "#6b6177");

        for (let i = 0; i < 4; i += 1) {
          fill(ctx, 10 + i * 24, 314, 6, 6, "rgba(255,246,229,0.13)");
          fill(ctx, 176 + i * 18, 312, 4, 4, "rgba(255,246,229,0.1)");
        }

        let x = 56 + lean * 9;
        let y = 232;
        let angle = 0;
        if (reaction.started) {
          const jump = Math.min(1, p / 0.58);
          x = 56 + lean * 9 + jump * 42;
          y = 232 - Math.sin(jump * Math.PI) * 58 + jump * jump * 34;
          angle = jump * 0.7;
        }

        fill(ctx, x - 8, y - 18, 15, 18, "#d94a4a");
        fill(ctx, x - 5, y - 28, 10, 11, "#f0b98b");
        fill(ctx, x - 7, y - 31, 14, 4, "#ffd447");
        fill(ctx, x - 7, y - 2, 5, 12, "#26395f");
        fill(ctx, x + 2, y - 2, 5, 12, "#26395f");
        fill(ctx, x - 13, y - 14, 5, 9, "#f0b98b");
        fill(ctx, x + 8, y - 14, 5, 9, "#f0b98b");

        if (reaction.started && p > 0.55) {
          for (let i = 0; i < 7; i += 1) {
            const a = (i / 7) * Math.PI * 2;
            fill(
              ctx,
              x + Math.cos(a) * (12 + p * 24),
              y + 8 + Math.sin(a) * (6 + p * 16),
              3,
              3,
              i % 2 ? C.paper : C.amber
            );
          }
          textCenter(ctx, "ПОЛЁТ!", x, y - 48, { size: 18, color: C.pink, shadowColor: "#171426" });
        }

        if (!reaction.started) {
          line(ctx, 24, 292, 58, 292, "rgba(255,213,71,0.45)", 2);
          line(ctx, 182, 292, 216, 292, "rgba(255,213,71,0.45)", 2);
          textCenter(ctx, "◀  РАЗБЕГ  ▶", 120, 303, { size: 9, color: "rgba(255,246,229,0.65)" });
          circle(ctx, 120, 110, 2 + Math.sin(t * 6), "rgba(255,246,229,0.35)");
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.amber);
        textCenter(ctx, "ПАРКУР", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "ПРОПАСТЬ ШИРЕ" : "ВЫБЕРИ РАЗБЕГ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );
      },
    };
  },
};
