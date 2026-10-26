import { C, fill, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "zombie",
  title: "ЗОМБИ",
  hint: "Стреляй первым. Патроны вроде есть.",
  input: "tap",
  duration: 5.2,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.3,
      delay: 1.1,
      reason: "Пистолет дал осечку. Зомби обрадовался.",
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

        fill(ctx, 0, 0, 240, 320, "#111827");
        fill(ctx, 0, 0, 240, 70, "#1a2437");
        for (let i = 0; i < 8; i += 1) {
          const x = i * 34;
          const h = 42 + (i % 4) * 18;
          fill(ctx, x + 2, 226 - h, 30, h, "#151d2d");
          fill(ctx, x + 7, 236 - h, 5, 8, "rgba(255,213,71,0.17)");
          fill(ctx, x + 20, 250 - h, 5, 8, "rgba(255,213,71,0.09)");
        }

        fill(ctx, 0, 226, 240, 94, "#1c2532");
        fill(ctx, 0, 226, 240, 4, "#334153");
        line(ctx, 0, 288, 240, 288, "rgba(255,246,229,0.14)", 1);
        for (let i = 0; i < 5; i += 1) {
          fill(ctx, 20 + i * 48, 279, 28, 3, "rgba(255,246,229,0.12)");
        }

        circle(ctx, 200, 44, 12, "#d9e2d0");
        fill(ctx, 196, 40, 3, 3, "rgba(120,130,120,0.45)");

        const zombieX = 164 + Math.sin(t * 1.3) * 5;
        const zombieY = 224;
        fill(ctx, zombieX - 12, zombieY - 30, 24, 44, "#4f6b4a");
        fill(ctx, zombieX - 8, zombieY - 48, 16, 20, "#6f8d60");
        fill(ctx, zombieX - 11, zombieY - 52, 22, 5, "#1f2a24");
        fill(ctx, zombieX - 6, zombieY - 42, 4, 4, C.amber);
        fill(ctx, zombieX + 3, zombieY - 42, 4, 4, C.amber);
        fill(ctx, zombieX - 4, zombieY - 34, 9, 3, "#2a1a1e");
        fill(ctx, zombieX - 22, zombieY - 24, 10, 34, "#58774f");
        fill(ctx, zombieX + 12, zombieY - 24, 10, 34, "#58774f");
        fill(ctx, zombieX - 12, zombieY + 14, 8, 12, "#354a35");
        fill(ctx, zombieX + 4, zombieY + 14, 8, 12, "#354a35");

        let lunge = 0;
        if (reaction.started) lunge = Math.min(1, p * 1.3);
        const zx = zombieX - lunge * 52;
        const zy = zombieY - lunge * 8;
        fill(ctx, zx - 12, zy - 30, 24, 44, "#4f6b4a");
        fill(ctx, zx - 8, zy - 48, 16, 20, "#6f8d60");
        fill(ctx, zx - 11, zy - 52, 22, 5, "#1f2a24");
        fill(ctx, zx - 6, zy - 42, 4, 4, C.amber);
        fill(ctx, zx + 3, zy - 42, 4, 4, C.amber);
        fill(ctx, zx - 4, zy - 34, 9, 3, "#2a1a1e");
        fill(ctx, zx - 24, zy - 24, 10, 34, "#58774f");
        fill(ctx, zx + 14, zy - 24, 10, 34, "#58774f");
        fill(ctx, zx - 12, zy + 14, 8, 12, "#354a35");
        fill(ctx, zx + 4, zy + 14, 8, 12, "#354a35");

        const playerX = 48;
        fill(ctx, playerX - 10, 216, 20, 34, "#3b7ed6");
        fill(ctx, playerX - 6, 196, 12, 15, "#f0b98b");
        fill(ctx, playerX - 8, 191, 16, 5, "#ffd447");
        fill(ctx, playerX - 10, 248, 7, 28, "#26395f");
        fill(ctx, playerX + 3, 248, 7, 28, "#26395f");
        fill(ctx, playerX + 8, 216, 20, 5, "#f0b98b");
        fill(ctx, playerX + 24, 212, 17, 7, "#505766");
        fill(ctx, playerX + 32, 219, 5, 9, "#363c48");

        if (!reaction.started) {
          textCenter(ctx, "ТАП — ВЫСТРЕЛ", 120, 304, { size: 10, color: "rgba(255,246,229,0.68)" });
          line(ctx, playerX + 38, 216, playerX + 54, 216, "rgba(255,213,71,0.45)", 1);
        } else {
          if (p < 0.28) {
            fill(ctx, playerX + 38, 208, 20, 5, C.amber);
            fill(ctx, playerX + 48, 203, 12, 3, "rgba(255,213,71,0.5)");
            textCenter(ctx, "КЛИК", 76, 188, { size: 10, color: C.paper });
          } else {
            textCenter(ctx, "ОСЕЧКА!", 120, 170, { size: 20, color: C.pink, shadowColor: "#0d121d" });
          }
          for (let i = 0; i < 7; i += 1) {
            const angle = (i / 7) * Math.PI * 2;
            fill(
              ctx,
              zx + Math.cos(angle) * (14 + p * 30),
              zy - 18 + Math.sin(angle) * (10 + p * 24),
              3,
              3,
              i % 2 ? C.paper : "#8fb57a"
            );
          }
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.pink);
        textCenter(ctx, "ЗОМБИ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "ПАТРОНЫ БЫЛИ ДЛЯ ВИДА" : "ТАП — ВЫСТРЕЛ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );
      },
    };
  },
};
