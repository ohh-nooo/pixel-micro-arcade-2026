import { C, fill, text, textCenter, line, circle, panel, box } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "heist",
  title: "ОГРАБЛЕНИЕ",
  hint: "Вскрой сейф. Охрана на перерыве.",
  input: "tap",
  duration: 5.4,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1.1,
      reason: "Сейф открылся. Внутри была охрана.",
      sound: "explode",
    });

    return {
      update(dt) {
        reaction.update(dt);
      },

      press(action) {
        if (action.type === "tap") reaction.start();
      },

      draw(ctx) {
        const t = reaction.t;
        const p = reaction.p;

        fill(ctx, 0, 0, 240, 320, "#171528");
        for (let y = 0; y < 320; y += 24) {
          fill(ctx, 0, y, 240, 1, "rgba(255,255,255,0.03)");
        }
        for (let x = 12; x < 240; x += 32) {
          fill(ctx, x, 0, 1, 320, "rgba(255,255,255,0.025)");
        }

        line(ctx, 24, 72, 214, 72, "rgba(232,71,63,0.45)", 1);
        line(ctx, 24, 292, 214, 292, "rgba(232,71,63,0.45)", 1);
        for (let i = 0; i < 7; i += 1) {
          circle(ctx, 24 + i * 32, 72, 2, C.red);
          circle(ctx, 24 + i * 32, 292, 2, C.red);
        }

        fill(ctx, 44, 86, 152, 188, "#2a2740");
        fill(ctx, 50, 92, 140, 176, "#45405f");
        fill(ctx, 57, 99, 126, 162, "#211e33");
        fill(ctx, 64, 106, 112, 148, "#5a5478");

        const dialX = reaction.started ? 112 - p * 36 : 120;
        circle(ctx, dialX, 180, 32, "#181528");
        circle(ctx, dialX, 180, 27, "#8b846f");
        circle(ctx, dialX, 180, 21, "#302c46");
        for (let i = 0; i < 8; i += 1) {
          const angle = (i / 8) * Math.PI * 2 + (reaction.started ? p * 9 : t * 0.7);
          line(
            ctx,
            120 + Math.cos(angle) * 95,
            180 + Math.sin(angle) * 95,
            120 + Math.cos(angle) * 103,
            180 + Math.sin(angle) * 103,
            "#c9c3b4",
            2
          );
        }
        line(ctx, 120, 180, 120, 160, "#e8473f", 3);
        circle(ctx, 120, 180, 4, C.amber);

        fill(ctx, 66, 246, 108, 10, "#151326");
        fill(ctx, 84, 256, 72, 5, "#0e0c18");

        if (reaction.started) {
          const open = Math.min(1, p * 1.5);
          fill(ctx, 64, 106, 112 * open, 148, "#100d1b");
          fill(ctx, 64, 106, 5, 148, "#7d745d");
          fill(ctx, 64 + 112 * open - 4, 106, 5, 148, "#7d745d");
          if (open > 0.7) {
            fill(ctx, 78, 128, 84, 8, "rgba(255,213,71,0.2)");
            fill(ctx, 88, 144, 50, 24, "#2a2838");
            fill(ctx, 94, 152, 9, 9, "#f0b98b");
            fill(ctx, 111, 153, 6, 15, "#334a76");
            fill(ctx, 124, 152, 8, 8, "#f0b98b");
            fill(ctx, 101, 146, 18, 5, "#1c2438");
            textCenter(ctx, "ОХРАНА", 120, 190, { size: 10, color: C.pink });
          }
          textCenter(ctx, "ЩЁЛК!", 120, 112, { size: 18, color: C.amber });
          for (let i = 0; i < 8; i += 1) {
            const angle = (i / 8) * Math.PI * 2;
            fill(
              ctx,
              120 + Math.cos(angle) * (30 + p * 58),
              180 + Math.sin(angle) * (22 + p * 42),
              3,
              3,
              i % 2 ? C.paper : C.amber
            );
          }
        }

        if (!reaction.started) {
          box(ctx, 52, 292, 136, 22, "#2c2845", C.ink, 2);
          textCenter(ctx, "ТАП — ВСКРЫТЬ", 120, 297, { size: 9, color: C.paper });
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.pink);
        textCenter(ctx, "ОГРАБЛЕНИЕ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "ОХРАНА НЕ НА ПЕРЕРЫВЕ" : "ТАП — ВСКРЫТЬ СЕЙФ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        text(ctx, "0", 20, 48, { size: 9, color: "rgba(255,246,229,0.45)" });
      },
    };
  },
};
