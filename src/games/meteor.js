import { C, fill, text, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "meteor",
  title: "МЕТЕОР",
  hint: "Подними щит. Метеорит уже близко.",
  input: "tap",
  duration: 5.4,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.3,
      delay: 1.2,
      reason: "Щит выдержал. Метеорит — нет.",
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

        fill(ctx, 0, 0, 240, 320, "#0d1124");
        for (let i = 0; i < 34; i += 1) {
          const x = (i * 53 + 11) % 240;
          const y = (i * 37 + 13) % 230;
          fill(ctx, x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1, "rgba(255,246,229,0.55)");
        }

        circle(ctx, 120, 312, 92, "#1f4d72");
        circle(ctx, 120, 312, 82, "#3b8b68");
        fill(ctx, 52, 258, 22, 12, "#2d7053");
        fill(ctx, 132, 248, 30, 16, "#2d7053");
        fill(ctx, 156, 270, 18, 10, "#2d7053");

        const meteorX = 186 - p * 58;
        const meteorY = 54 + reaction.stateT * 56;
        const meteorR = 15 + reaction.stateT * 13;
        for (let i = 0; i < 5; i += 1) {
          circle(ctx, meteorX + 12 + i * 7, meteorY - 8 - i * 6, meteorR * (0.8 - i * 0.12), "rgba(255,128,70,0.08)");
        }
        circle(ctx, meteorX, meteorY, meteorR, "#7b4a3a");
        circle(ctx, meteorX - 4, meteorY - 4, meteorR * 0.55, "#a96b4d");
        fill(ctx, meteorX - 7, meteorY - 2, 5, 4, "#4a2b27");
        fill(ctx, meteorX + 3, meteorY + 4, 4, 3, "#4a2b27");

        const shieldAlpha = reaction.started ? 1 : 0.22 + Math.sin(t * 4) * 0.08;
        ctx.save();
        ctx.globalAlpha = shieldAlpha;
        ctx.strokeStyle = C.mint;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(120, 278, 64, Math.PI * 1.08, Math.PI * 1.92);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,246,229,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(120, 278, 56, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
        ctx.restore();

        if (reaction.started) {
          for (let i = 0; i < 9; i += 1) {
            const angle = (i / 9) * Math.PI * 2;
            const dist = 14 + p * 54;
            fill(
              ctx,
              meteorX + Math.cos(angle) * dist,
              meteorY + Math.sin(angle) * dist,
              3,
              3,
              i % 2 ? C.amber : C.paper
            );
          }
          textCenter(ctx, "БУМ!", 120, 142, { size: 28, color: C.amber, shadowColor: "#1a0d16" });
          line(ctx, meteorX - meteorR, meteorY, meteorX + meteorR, meteorY, "rgba(255,255,255,0.6)", 1);
          line(ctx, meteorX, meteorY - meteorR, meteorX, meteorY + meteorR, "rgba(255,255,255,0.6)", 1);
        }

        if (!reaction.started) {
          textCenter(ctx, "ТАП — ЩИТ", 120, 300, { size: 10, color: "rgba(255,246,229,0.68)" });
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.mint);
        textCenter(ctx, "МЕТЕОР", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "ЩИТ БЫЛ НЕ ТОГО РАЗМЕРА" : "ТАП — ПОДНЯТЬ ЩИТ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        text(ctx, "0/1", 18, 54, { size: 9, color: "rgba(255,246,229,0.5)" });
        text(ctx, "x1", 222, 54, { size: 9, color: "rgba(255,246,229,0.5)", align: "right" });
      },
    };
  },
};
