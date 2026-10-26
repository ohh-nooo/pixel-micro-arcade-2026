import { C, fill, text, textCenter, line, panel, box, circle } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "bank",
  title: "БАНК",
  hint: "Вставь карту. Банк уже знает.",
  input: "tap",
  duration: 5.2,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.3,
      delay: 1.1,
      reason: "Банк вернул карту. И забрал её обратно.",
      sound: "crash",
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
        const alarm = reaction.started && Math.sin(t * 18) > 0;

        fill(ctx, 0, 0, 240, 320, "#141528");
        for (let i = 0; i < 10; i += 1) {
          fill(ctx, i * 28, 0, 2, 320, "rgba(255,255,255,0.02)");
        }

        fill(ctx, 0, 214, 240, 106, "#23213a");
        fill(ctx, 0, 214, 240, 4, "#3c3858");
        fill(ctx, 0, 300, 240, 20, "#161428");

        if (alarm) {
          circle(ctx, 30, 36, 26, "rgba(232,71,63,0.18)");
          circle(ctx, 210, 36, 26, "rgba(232,71,63,0.18)");
        }
        fill(ctx, 24, 24, 12, 8, alarm ? C.red : "#4a3c55");
        fill(ctx, 204, 24, 12, 8, alarm ? C.red : "#4a3c55");

        panel(ctx, 54, 52, 132, 190, "#2c2a4a");
        fill(ctx, 54, 52, 132, 5, alarm ? C.red : C.mint);

        box(ctx, 68, 72, 104, 56, "#102b2b", C.ink, 2);
        fill(ctx, 74, 78, 92, 44, "#173f3f");
        textCenter(ctx, "ВВЕДИТЕ ПИН", 120, 84, { size: 9, color: alarm ? "#ffb3c1" : "#8be2cd" });
        textCenter(ctx, alarm ? "КАРТА ИЗЪЯТА" : "••••", 120, 103, {
          size: 13,
          color: alarm ? C.pink : C.paper,
          shadowColor: "#082020",
        });

        fill(ctx, 72, 140, 96, 8, "#18162b");
        fill(ctx, 77, 142, 86, 3, "#0b0a15");
        fill(ctx, 78, 182, 84, 44, "#25223c");
        for (let r = 0; r < 3; r += 1) {
          for (let c = 0; c < 3; c += 1) {
            const x = 82 + c * 26;
            const y = 186 + r * 13;
            fill(ctx, x, y, 21, 9, "#3e395b");
            fill(ctx, x + 2, y + 2, 17, 5, "#504a72");
            fill(ctx, x + 7, y + 3, 7, 3, "rgba(255,246,229,0.25)");
          }
        }

        fill(ctx, 108, 244, 24, 10, "#171528");
        fill(ctx, 112, 248, 16, 3, "#0b0a15");
        fill(ctx, 70, 262, 100, 6, "#19172a");

        const cardY = reaction.started ? 140 - p * 18 : 136 + Math.sin(t * 3) * 2;
        fill(ctx, 164, cardY, 42, 26, "#e4c76b");
        fill(ctx, 168, cardY + 5, 12, 8, "#f7e8a4");
        fill(ctx, 184, cardY + 16, 18, 3, "#8b6e32");
        if (reaction.started) {
          line(ctx, 164, cardY, 128, 148, "rgba(255,246,229,0.35)", 1);
          textCenter(ctx, "ПИК!", 146, 124, { size: 16, color: C.amber });
        }

        if (reaction.started) {
          for (let i = 0; i < 7; i += 1) {
            const angle = (i / 7) * Math.PI * 2;
            fill(
              ctx,
              120 + Math.cos(angle) * (34 + p * 60),
              200 + Math.sin(angle) * (16 + p * 20),
              3,
              3,
              i % 2 ? C.red : C.paper
            );
          }
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, alarm ? C.red : C.mint);
        textCenter(ctx, "БАНК", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "СИГНАЛИЗАЦИЯ" : "ТАП — ВСТАВИТЬ КАРТУ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        if (!reaction.started) {
          circle(ctx, 120, 286, 3 + Math.sin(t * 7) * 1, C.amber);
        }
      },
    };
  },
};
