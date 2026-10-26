import { C, fill, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "volcano",
  title: "ВУЛКАН",
  hint: "Заткни кратер. Лава подождёт.",
  input: "tap",
  duration: 5.4,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.3,
      delay: 1.2,
      reason: "Пробка вылетела. Вместе с вулканом.",
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

        const sky = ctx.createLinearGradient(0, 0, 0, 270);
        sky.addColorStop(0, "#24152d");
        sky.addColorStop(0.6, "#7b3544");
        sky.addColorStop(1, "#e07a4a");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 240, 270);

        for (let i = 0; i < 5; i += 1) {
          fill(ctx, 10 + i * 48, 56 + i * 12, 30, 3, "rgba(255,246,229,0.12)");
        }
        circle(ctx, 198, 58, 17, "#ffd58a");

        fill(ctx, 0, 246, 240, 74, "#3a2a30");
        fill(ctx, 0, 246, 240, 4, "#60414a");
        fill(ctx, 0, 286, 240, 34, "#241a20");

        ctx.fillStyle = "#4a2b36";
        ctx.beginPath();
        ctx.moveTo(12, 250);
        ctx.lineTo(88, 128);
        ctx.lineTo(112, 112);
        ctx.lineTo(128, 112);
        ctx.lineTo(156, 128);
        ctx.lineTo(228, 250);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#6d3b42";
        ctx.beginPath();
        ctx.moveTo(88, 128);
        ctx.lineTo(112, 112);
        ctx.lineTo(126, 134);
        ctx.lineTo(104, 170);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#5a313b";
        ctx.beginPath();
        ctx.moveTo(156, 128);
        ctx.lineTo(128, 112);
        ctx.lineTo(134, 142);
        ctx.lineTo(164, 178);
        ctx.closePath();
        ctx.fill();

        const glow = 0.25 + Math.sin(t * 5) * 0.1;
        fill(ctx, 104, 116, 32, 9, "#c94b34");
        fill(ctx, 108, 118, 24, 4, `rgba(255,213,71,${glow + 0.4})`);
        for (let i = 0; i < 5; i += 1) {
          const x = 100 + i * 10;
          fill(ctx, x, 152 + (i % 3) * 20, 4, 12, "rgba(232,71,63,0.35)");
        }

        if (!reaction.started) {
          fill(ctx, 104, 104, 32, 12, "#4a3a32");
          fill(ctx, 108, 101, 24, 5, "#7b5a43");
          textCenter(ctx, "ТАП — ЗАТКНУТЬ", 120, 300, { size: 10, color: "rgba(255,246,229,0.66)" });
        } else {
          const plug = Math.min(1, p * 2.4);
          fill(ctx, 106, 104 - plug * 10, 28, 12, "#7b5a43");
          if (p > 0.35) {
            const burst = Math.min(1, (p - 0.35) / 0.65);
            for (let i = 0; i < 12; i += 1) {
              const angle = (i / 12) * Math.PI * 2 + t;
              const dist = 10 + burst * 62;
              fill(
                ctx,
                120 + Math.cos(angle) * dist,
                128 + Math.sin(angle) * dist * 0.8,
                4,
                4,
                i % 3 === 0 ? "#ffd06a" : "#e8473f"
              );
            }
            textCenter(ctx, "БУМ!", 120, 68, { size: 30, color: C.amber, shadowColor: "#2b1019" });
            fill(ctx, 84, 112, 72, 5, "rgba(255,180,80,0.35)");
          }
        }

        if (reaction.started) {
          for (let i = 0; i < 4; i += 1) {
            const sx = 106 + i * 12;
            const sy = 130 + i * 26 + p * 12;
            fill(ctx, sx, sy, 4, 6, "rgba(232,71,63,0.45)");
          }
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.red);
        textCenter(ctx, "ВУЛКАН", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "ПРОБКА НЕ ПОДОШЛА" : "ТАП — ЗАТКНУТЬ КРАТЕР",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        line(ctx, 10, 272, 60, 272, "rgba(255,246,229,0.12)", 1);
      },
    };
  },
};
