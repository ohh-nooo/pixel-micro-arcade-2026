import { C, fill, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "skate",
  title: "СКЕЙТ",
  hint: "Сделай трюк. Рельса длинная.",
  input: "sides",
  duration: 5.4,

  create(api) {
    let lean = 0;
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1.1,
      reason: "Рельса закончилась раньше трюка.",
      sound: "crash",
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

        fill(ctx, 0, 0, 240, 320, "#2d2a45");
        fill(ctx, 0, 188, 240, 132, "#5b4b58");
        fill(ctx, 0, 188, 240, 4, "#7c6671");
        for (let i = 0; i < 7; i += 1) {
          fill(ctx, i * 38, 232 + (i % 3) * 18, 22, 3, "rgba(20,16,28,0.22)");
        }

        for (let i = 0; i < 5; i += 1) {
          const x = 20 + i * 50;
          const h = 48 + (i % 3) * 20;
          fill(ctx, x, 188 - h, 38, h, "#24223a");
          fill(ctx, x + 7, 188 - h + 10, 24, 13, "rgba(255,213,71,0.16)");
        }
        fill(ctx, 0, 0, 240, 12, "#191827");

        fill(ctx, 34, 206, 172, 5, "#c9c3b4");
        fill(ctx, 34, 206, 172, 2, "#efeadf");
        for (let i = 0; i < 7; i += 1) {
          fill(ctx, 44 + i * 24, 211, 5, 28, "#8c887f");
        }
        fill(ctx, 78, 228, 4, 42, "#6b6570");
        fill(ctx, 158, 228, 4, 42, "#6b6570");

        const x = reaction.started ? 54 + Math.min(1, p / 0.78) * 132 : 54;
        let y = 192;
        let angle = 0;
        if (reaction.started && p > 0.78) {
          const fall = (p - 0.78) / 0.22;
          y = 192 + fall * fall * 86;
          angle = fall * 2.2;
        }

        fill(ctx, x - 16, y + 10, 32, 4, "#3b315c");
        circle(ctx, x - 9, y + 15, 4, C.amber);
        circle(ctx, x + 9, y + 15, 4, C.amber);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        fill(ctx, -7, -18, 14, 18, "#59c6b5");
        fill(ctx, -4, -28, 8, 11, "#f0b98b");
        fill(ctx, -6, -31, 12, 4, "#e8473f");
        fill(ctx, -10, -12 + lean * 2, 4, 10, "#f0b98b");
        fill(ctx, 6, -12 - lean * 2, 4, 10, "#f0b98b");
        fill(ctx, -6, -3, 4, 12, "#26395f");
        fill(ctx, 2, -3, 4, 12, "#26395f");
        ctx.restore();

        if (reaction.started && p > 0.7) {
          for (let i = 0; i < 8; i += 1) {
            const a = (i / 8) * Math.PI * 2;
            const dist = 10 + p * 26;
            fill(
              ctx,
              x + Math.cos(a) * dist,
              y + Math.sin(a) * dist,
              3,
              3,
              i % 2 ? C.paper : C.amber
            );
          }
          textCenter(ctx, "ХРЯСЬ!", x, y - 46, { size: 20, color: C.pink, shadowColor: "#191827" });
        }

        if (!reaction.started) {
          line(ctx, 40, 188, 198, 188, "rgba(255,213,71,0.35)", 1);
          textCenter(ctx, "◀  БАЛАНС  ▶", 120, 302, { size: 9, color: "rgba(255,246,229,0.62)" });
          circle(ctx, 120, 112, 2 + Math.sin(t * 6), "rgba(255,255,255,0.25)");
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.mint);
        textCenter(ctx, "СКЕЙТ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "РЕЛЬСА КОРОЧЕ" : "ВЫБЕРИ БАЛАНС",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );
      },
    };
  },
};
