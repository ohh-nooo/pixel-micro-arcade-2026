import { C, fill, textCenter, line, circle, panel } from "../engine/gfx.js";
import { clamp } from "../engine/utils.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "taxi",
  title: "ТАКСИ",
  hint: "Поймай такси. Оно уже близко.",
  input: "sides",
  duration: 5.4,

  create(api) {
    let hail = 0;
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1.1,
      reason: "Такси проехало мимо. Как и все предыдущие.",
      sound: "thud",
    });

    return {
      update(dt) {
        reaction.update(dt);
      },

      press(action) {
        if (reaction.started) return;
        if (action.type === "left") hail = clamp(hail - 1, -1, 1);
        if (action.type === "right") hail = clamp(hail + 1, -1, 1);
        if (action.type === "left" || action.type === "right") api.audio.ui();
      },

      draw(ctx) {
        const t = reaction.t;
        const p = reaction.p;

        fill(ctx, 0, 0, 240, 320, "#171a31");
        for (let i = 0; i < 6; i += 1) {
          const x = i * 44;
          const h = 72 + (i % 3) * 32;
          fill(ctx, x, 198 - h, 38, h, "#232641");
          for (let y = 206 - h; y < 190; y += 20) {
            fill(ctx, x + 6, y, 6, 8, i % 2 ? "rgba(255,213,71,0.3)" : "rgba(120,180,220,0.2)");
            fill(ctx, x + 22, y, 6, 8, "rgba(255,213,71,0.12)");
          }
        }

        fill(ctx, 0, 228, 240, 92, "#2b2a3e");
        fill(ctx, 0, 228, 240, 4, "#4a4762");
        fill(ctx, 0, 300, 240, 20, "#1e1c30");
        line(ctx, 0, 278, 240, 278, "rgba(255,246,229,0.25)", 2);
        for (let i = 0; i < 5; i += 1) {
          fill(ctx, 20 + i * 54, 286, 30, 3, "rgba(255,246,229,0.15)");
        }

        const taxiX = reaction.started ? 196 - Math.min(1, p / 0.8) * 220 : 196 + Math.sin(t * 1.4) * 12;
        const taxiY = 246;
        fill(ctx, taxiX - 30, taxiY, 62, 22, "#e8b13d");
        fill(ctx, taxiX - 22, taxiY - 15, 42, 17, "#e8b13d");
        fill(ctx, taxiX - 16, taxiY - 12, 13, 10, "#7e9db4");
        fill(ctx, taxiX + 1, taxiY - 12, 13, 10, "#7e9db4");
        fill(ctx, taxiX - 30, taxiY + 6, 62, 4, "#6b5a2d");
        fill(ctx, taxiX - 24, taxiY + 20, 12, 7, "#151222");
        fill(ctx, taxiX + 16, taxiY + 20, 12, 7, "#151222");
        fill(ctx, taxiX - 12, taxiY - 26, 28, 8, "#ffd447");
        textCenter(ctx, "ТАКСИ", taxiX + 2, taxiY - 26, { size: 7, color: C.ink, shadow: false });

        if (reaction.started) {
          for (let i = 0; i < 8; i += 1) {
            fill(ctx, taxiX - 20 - i * 9, taxiY + 2 + (i % 2) * 3, 2, 10, "rgba(255,246,229,0.18)");
          }
          if (p > 0.55) {
            textCenter(ctx, "МИМО", 120, 178, { size: 20, color: C.pink, shadowColor: "#171a31" });
          }
        }

        const playerX = 36 + hail * 6;
        fill(ctx, playerX - 8, 214, 16, 26, "#3b7ed6");
        fill(ctx, playerX - 5, 196, 10, 13, "#f0b98b");
        fill(ctx, playerX - 7, 192, 14, 5, "#ffd447");
        fill(ctx, playerX - 8, 238, 6, 28, "#26395f");
        fill(ctx, playerX + 2, 238, 6, 28, "#26395f");
        const armY = reaction.started ? 186 : 198 + Math.sin(t * 4) * 4;
        fill(ctx, playerX + 6, armY, 5, 22, "#f0b98b");
        fill(ctx, playerX + 6, armY - 5, 10, 5, "#f0b98b");

        if (!reaction.started) {
          textCenter(ctx, "◀  ГОЛОСУЙ  ▶", 120, 306, { size: 9, color: "rgba(255,246,229,0.65)" });
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.amber);
        textCenter(ctx, "ТАКСИ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "ВОДИТЕЛЬ НЕ ОСТАНОВИЛСЯ" : "ВЫБЕРИ, ГДЕ ГОЛОСОВАТЬ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        circle(ctx, 192, 212, 5, "rgba(255,213,71,0.65)");
        line(ctx, 192, 217, 192, 228, "#5b5049", 3);
      },
    };
  },
};
