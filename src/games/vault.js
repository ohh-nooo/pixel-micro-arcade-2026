import { C, fill, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "vault",
  title: "ХРАНИЛИЩЕ",
  hint: "Подбери ключ. Замок почти открыт.",
  input: "sides",
  duration: 5.4,

  create(api) {
    let key = 1;
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1.1,
      reason: "Ключ подошёл. Дверь открылась в стену.",
      sound: "thud",
    });

    return {
      update(dt) {
        reaction.update(dt);
      },

      press(action) {
        if (reaction.started) return;
        if (action.type === "left") key = (key + 2) % 3;
        if (action.type === "right") key = (key + 1) % 3;
        if (action.type === "left" || action.type === "right") api.audio.ui();
      },

      draw(ctx) {
        const t = reaction.t;
        const p = reaction.p;

        fill(ctx, 0, 0, 240, 320, "#24213a");
        for (let y = 0; y < 320; y += 26) {
          fill(ctx, 0, y, 240, 1, "rgba(255,255,255,0.035)");
        }
        for (let x = 0; x < 240; x += 28) {
          fill(ctx, x, 0, 1, 320, "rgba(255,255,255,0.025)");
        }

        fill(ctx, 38, 82, 164, 188, "#171426");
        fill(ctx, 44, 88, 152, 176, "#49445f");
        fill(ctx, 50, 94, 140, 164, "#2c2942");
        fill(ctx, 58, 102, 124, 148, "#5c5678");

        circle(ctx, 120, 176, 45, "#1b1830");
        circle(ctx, 120, 176, 38, "#8d866f");
        circle(ctx, 120, 176, 30, "#35304c");
        for (let i = 0; i < 6; i += 1) {
          const angle = (i / 6) * Math.PI * 2;
          line(
            ctx,
            120 + Math.cos(angle) * 36,
            176 + Math.sin(angle) * 36,
            120 + Math.cos(angle) * 43,
            176 + Math.sin(angle) * 43,
            "#d8d2c2",
            2
          );
        }
        fill(ctx, 114, 158, 12, 32, "#161222");
        fill(ctx, 117, 164, 6, 18, "#5c5678");

        if (reaction.started) {
          const open = Math.min(1, p * 1.5);
          fill(ctx, 58, 102, 124 * (1 - open * 0.62), 148, "#1a1628");
          if (open > 0.65) {
            fill(ctx, 120, 118, 62, 116, "#4a3540");
            for (let y = 120; y < 234; y += 13) {
              for (let x = 124 + ((y / 13) % 2) * 12; x < 180; x += 26) {
                fill(ctx, x, y, 22, 10, "#6b4c55");
                fill(ctx, x, y, 22, 2, "rgba(255,255,255,0.08)");
              }
            }
            textCenter(ctx, "СТЕНА", 151, 160, { size: 11, color: C.paper });
          }
          const kx = 120 + (key - 1) * 22;
          fill(ctx, kx - 4, 210, 8, 16, "#e4c76b");
          fill(ctx, kx - 8, 224, 16, 5, "#e4c76b");
          textCenter(ctx, "ЩЁЛК!", 120, 120, { size: 18, color: C.amber });
        }

        for (let i = 0; i < 3; i += 1) {
          const x = 58 + i * 62;
          const active = i === key && !reaction.started;
          fill(ctx, x - 14, 278, 28, 8, active ? C.amber : "#3c3858");
          fill(ctx, x - 4, 266, 8, 14, active ? C.amber : "#756b8c");
          fill(ctx, x - 8, 276, 16, 4, active ? C.amber : "#756b8c");
          if (active) {
            for (let k = 0; k < 3; k += 1) {
              circle(ctx, x - 4 + k * 4, 263 - Math.sin(t * 5 + k) * 2, 1, C.paper);
            }
          }
        }

        if (!reaction.started) {
          textCenter(ctx, "◀  ВЫБЕРИ КЛЮЧ  ▶", 120, 304, { size: 9, color: "rgba(255,246,229,0.62)" });
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.mint);
        textCenter(ctx, "ХРАНИЛИЩЕ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "ЗА ДВЕРЬЮ — СТЕНА" : "ВЫБЕРИ КЛЮЧ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );
      },
    };
  },
};
