import { C, fill, text, textCenter, line, circle, panel } from "../engine/gfx.js";
import { clamp } from "../engine/utils.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "archery",
  title: "СТРЕЛЬБА",
  hint: "Попади в яблоко. Ветер уже договорился.",
  input: "sides",
  duration: 5.4,

  create(api) {
    let aim = 120;
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1,
      reason: "Стрела ушла в молоко. Ветер был за яблоко.",
      sound: "thud",
    });

    return {
      update(dt) {
        reaction.update(dt);
      },

      press(action) {
        if (reaction.started) return;
        if (action.type === "left") aim = clamp(aim - 22, 80, 200);
        if (action.type === "right") aim = clamp(aim + 22, 80, 200);
        if (action.type === "left" || action.type === "right") api.audio.ui();
      },

      draw(ctx) {
        const t = reaction.t;
        const p = reaction.p;

        const sky = ctx.createLinearGradient(0, 0, 0, 280);
        sky.addColorStop(0, "#243253");
        sky.addColorStop(0.6, "#9a5e63");
        sky.addColorStop(1, "#e6a45e");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 240, 280);

        circle(ctx, 200, 64, 18, "#ffdd7d");
        for (let i = 0; i < 4; i += 1) {
          fill(ctx, 18 + i * 56 + Math.sin(t + i) * 5, 70 + i * 14, 30, 3, "rgba(255,246,229,0.13)");
        }

        for (let i = 0; i < 4; i += 1) {
          const h = 40 + i * 23;
          fill(ctx, i * 60 - 10, 280 - h, 70, h, ["#43354a", "#3b3046", "#332b40", "#2a2539"][i]);
        }

        fill(ctx, 0, 280, 240, 40, "#2c3f33");
        fill(ctx, 0, 280, 240, 4, "#466449");

        const targetY = 152;
        for (let i = 4; i >= 0; i -= 1) {
          circle(ctx, 184, targetY, 12 + i * 8, i % 2 ? "#fff6e5" : "#e8473f");
        }
        circle(ctx, 184, targetY, 5, "#d9b44a");
        fill(ctx, 182, targetY - 36, 4, 72, "#7a5230");

        const bob = Math.sin(t * 4) * 1.5;
        fill(ctx, 38, 244, 20, 34, "#315864");
        fill(ctx, 42, 224, 12, 22, "#f0b98b");
        fill(ctx, 40, 220, 16, 5, "#2a2a3e");
        fill(ctx, 34, 248, 8, 30, "#243a50");
        fill(ctx, 54, 248, 8, 30, "#243a50");
        fill(ctx, 58, 232, 4, 18, "#f0b98b");

        const aimX = aim;
        const aimY = targetY + Math.sin(t * 2) * 3;
        const bowY = 236 + bob;
        ctx.strokeStyle = "#c9a46a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(64, bowY, 26, -1.2, 1.2);
        ctx.stroke();
        line(ctx, 64, bowY - 24, 64, bowY + 24, "rgba(255,246,229,0.65)", 1);

        if (!reaction.started) {
          line(ctx, 64, bowY, aimX, aimY, "rgba(255,246,229,0.3)", 1);
          fill(ctx, aimX - 8, aimY, 16, 2, C.amber);
          fill(ctx, aimX, aimY - 8, 2, 16, C.amber);
          textCenter(ctx, "◀  ЦЕЛЬСЯ  ▶", 120, 300, { size: 10, color: "rgba(255,246,229,0.65)" });
        } else {
          const ax = 66 + (aimX - 66) * p;
          const ay = bowY + (aimY - bowY) * p + p * p * 42;
          line(ctx, ax - 18, ay - 12, ax, ay, "#c9a46a", 2);
          fill(ctx, ax, ay - 2, 5, 5, C.paper);
          fill(ctx, ax + 3, ay - 4, 5, 2, C.amber);
          if (p > 0.8) {
            textCenter(ctx, "МИМО", 174, 194, { size: 18, color: C.pink, shadowColor: "#1a1326" });
          }
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.amber);
        textCenter(ctx, "СТРЕЛЬБА", 120, 13, { size: 12, color: C.paper });
        text(
          ctx,
          reaction.started ? "ВЕТЕР ПОБЕДИЛ" : "ВЫБЕРИ ПРИЦЕЛ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0", align: "center" }
        );

        text(ctx, "10", 18, 52, { size: 9, color: "rgba(255,246,229,0.6)" });
        text(ctx, "0", 222, 52, { size: 9, color: "rgba(255,246,229,0.6)", align: "right" });
      },
    };
  },
};
