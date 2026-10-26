import { C, fill, text, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "rocket",
  title: "РАКЕТА",
  hint: "Запусти ракету. Топливо почти есть.",
  input: "tap",
  duration: 5.4,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.3,
      delay: 1.2,
      reason: "Ракета взлетела. На полметра.",
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

        fill(ctx, 0, 0, 240, 320, "#0e1730");
        for (let i = 0; i < 30; i += 1) {
          const x = (i * 59 + 9) % 240;
          const y = (i * 41 + 17) % 230;
          fill(ctx, x, y, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1, "rgba(255,246,229,0.6)");
        }
        circle(ctx, 198, 54, 16, "#f4e7b5");
        circle(ctx, 192, 49, 4, "rgba(190,175,130,0.55)");

        fill(ctx, 0, 270, 240, 50, "#1a2734");
        fill(ctx, 0, 270, 240, 4, "#3b5261");
        fill(ctx, 82, 258, 76, 13, "#323d49");
        fill(ctx, 94, 250, 52, 8, "#4b5966");
        fill(ctx, 64, 268, 18, 7, "#232d38");
        fill(ctx, 158, 268, 18, 7, "#232d38");

        let rocketX = 120;
        let rocketY = 248;
        let rocketAngle = 0;
        let exploded = false;
        if (reaction.started) {
          rocketY = 248 - Math.min(1, p / 0.72) * 116;
          rocketX = 120 + Math.sin(p * 7) * 6;
          rocketAngle = Math.sin(p * 8) * 0.18;
          exploded = p > 0.72;
        }

        if (!exploded) {
          ctx.save();
          ctx.translate(rocketX, rocketY);
          ctx.rotate(rocketAngle);
          fill(ctx, -12, -24, 24, 54, "#e7e2d8");
          fill(ctx, -12, -24, 5, 54, "#fff6e5");
          fill(ctx, -12, -2, 24, 7, "#d94a4a");
          fill(ctx, -16, 22, 10, 18, "#d94a4a");
          fill(ctx, 6, 22, 10, 18, "#d94a4a");
          fill(ctx, -5, 30, 10, 10, "#5d6977");
          circle(ctx, 0, -9, 5, "#4b7fb8");
          ctx.restore();

          const flame = 6 + Math.sin(t * 20) * 3;
          fill(ctx, rocketX - 4, rocketY + 38, 8, flame, C.amber);
          fill(ctx, rocketX - 2, rocketY + 38, 4, flame + 5, C.red);

          if (reaction.started) {
            for (let i = 0; i < 4; i += 1) {
              fill(
                ctx,
                rocketX - 16 + i * 10,
                rocketY + 46 + i * 13 + p * 18,
                12,
                6,
                `rgba(220,220,210,${0.32 - i * 0.05})`
              );
            }
          }
        } else {
          const burst = Math.min(1, (p - 0.72) / 0.28);
          for (let i = 0; i < 10; i += 1) {
            const angle = (i / 10) * Math.PI * 2 + t;
            const dist = 12 + burst * 54;
            fill(
              ctx,
              120 + Math.cos(angle) * dist,
              140 + Math.sin(angle) * dist * 0.7,
              4,
              4,
              i % 2 ? C.amber : C.red
            );
          }
          circle(ctx, 120, 140, 18 + burst * 12, "rgba(255,140,70,0.25)");
          textCenter(ctx, "БУМ!", 120, 112, { size: 28, color: C.amber, shadowColor: "#160d1b" });
        }

        if (!reaction.started) {
          textCenter(ctx, "ТАП — ПУСК", 120, 298, { size: 10, color: "rgba(255,246,229,0.7)" });
          line(ctx, 80, 246, 160, 246, "rgba(255,213,71,0.35)", 1);
        } else {
          const count = Math.max(0, 3 - Math.floor(p * 3));
          textCenter(ctx, String(count), 46, 286, { size: 15, color: C.amber });
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.red);
        textCenter(ctx, "РАКЕТА", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "ПОЛМЕТРА — ЭТО МНОГО" : "ТАП — ЗАПУСК",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        text(ctx, "T-13", 18, 52, { size: 9, color: "rgba(255,246,229,0.42)" });
      },
    };
  },
};
