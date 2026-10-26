import { C, fill, text, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "pizza",
  title: "ПИЦЦА",
  hint: "Разрежь пиццу. Нож уже затупился.",
  input: "tap",
  duration: 5.2,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.3,
      delay: 1.1,
      reason: "Пицца оказалась картонной. Нож — тоже.",
      sound: "thud",
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

        fill(ctx, 0, 0, 240, 320, "#3b243b");
        for (let x = 0; x < 240; x += 24) {
          fill(ctx, x, 0, 1, 320, "rgba(255,255,255,0.025)");
        }
        fill(ctx, 0, 256, 240, 64, "#2a1a2b");
        fill(ctx, 0, 256, 240, 4, "#5d3b5f");

        circle(ctx, 120, 188, 98, "#161224");
        circle(ctx, 120, 188, 88, "#d9a352");
        circle(ctx, 120, 188, 80, "#f0bd63");
        circle(ctx, 120, 188, 72, "#e8a64e");

        for (let i = 0; i < 12; i += 1) {
          const angle = (i / 12) * Math.PI * 2 + t * 0.08;
          const r = 22 + (i % 4) * 13;
          circle(ctx, 120 + Math.cos(angle) * r, 188 + Math.sin(angle) * r, 6, "#c84a3d");
          fill(ctx, 120 + Math.cos(angle) * r - 3, 188 + Math.sin(angle) * r - 2, 4, 3, "#ff8c73");
        }
        for (let i = 0; i < 8; i += 1) {
          const angle = (i / 8) * Math.PI * 2;
          const r = 48 + (i % 2) * 12;
          fill(ctx, 120 + Math.cos(angle) * r - 5, 188 + Math.sin(angle) * r - 2, 10, 4, "#4f9b55");
        }

        const press = reaction.started ? Math.min(1, p * 2.2) : 0;
        ctx.save();
        ctx.translate(112, 92 + press * 40);
        ctx.rotate(-0.28 + press * 0.1);
        fill(ctx, -4, 0, 8, 76, "#c9c3b4");
        fill(ctx, -4, 0, 8, 6, "#efeadf");
        fill(ctx, -4, 66, 8, 14, "#8c887f");
        fill(ctx, -14, 78, 28, 9, "#5e5a63");
        ctx.restore();

        if (reaction.started && p > 0.35) {
          const bend = Math.min(1, (p - 0.35) / 0.65);
          line(ctx, 112, 164, 148, 160 + bend * 12, "#8c887f", 3);
          fill(ctx, 144, 156 + bend * 10, 10, 5, "#c9c3b4");
          textCenter(ctx, "ХРУСЬ!", 120, 76, { size: 20, color: C.amber, shadowColor: "#1a1020" });
          for (let i = 0; i < 7; i += 1) {
            const angle = (i / 7) * Math.PI * 2;
            fill(
              ctx,
              136 + Math.cos(angle) * (18 + bend * 38),
              188 + Math.sin(angle) * (14 + bend * 30),
              3,
              3,
              i % 2 ? C.paper : "#f0bd63"
            );
          }
          textCenter(ctx, "ПИЦЦА ЦЕЛА", 120, 300, { size: 10, color: C.pink });
        } else if (!reaction.started) {
          textCenter(ctx, "ТАП — РАЗРЕЗАТЬ", 120, 300, { size: 10, color: "rgba(255,246,229,0.72)" });
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.red);
        textCenter(ctx, "ПИЦЦА", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "НОЖ СДАЛСЯ" : "ТАП — РАЗРЕЗАТЬ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        text(ctx, "0", 18, 50, { size: 9, color: "rgba(255,246,229,0.45)" });
      },
    };
  },
};
