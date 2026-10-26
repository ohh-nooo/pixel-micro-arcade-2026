import { C, fill, text, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "rope",
  title: "КАНАТ",
  hint: "Тяни сильнее. Канат почти новый.",
  input: "tap",
  duration: 5.4,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1.1,
      reason: "Канат порвался. Соперник даже не вспотел.",
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

        const sky = ctx.createLinearGradient(0, 0, 0, 250);
        sky.addColorStop(0, "#f0bd72");
        sky.addColorStop(1, "#f6e4b8");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 240, 250);

        circle(ctx, 188, 62, 20, "rgba(255,246,229,0.5)");
        for (let i = 0; i < 4; i += 1) {
          fill(ctx, 20 + i * 58, 60 + i * 16, 32, 4, "rgba(120,80,60,0.12)");
        }

        fill(ctx, 0, 238, 240, 82, "#8a6748");
        fill(ctx, 0, 238, 240, 4, "#b18860");
        for (let i = 0; i < 6; i += 1) {
          fill(ctx, i * 44, 274, 26, 3, "rgba(70,45,28,0.22)");
        }
        line(ctx, 42, 248, 198, 248, "rgba(70,45,20,0.18)", 2);

        const pull = reaction.started ? Math.min(1, p * 1.7) : 0;
        const knotX = 112 - pull * 12;
        const snap = reaction.started && p > 0.55;

        if (!snap) {
          line(ctx, 26, 248, knotX, 248 - Math.sin(t * 3) * 2, "#e0c38a", 4);
          line(ctx, knotX, 248, 214, 248 + Math.sin(t * 2) * 2, "#c9a46a", 4);
          fill(ctx, knotX - 5, 243, 10, 10, "#9b7345");
        } else {
          const drop = Math.min(1, (p - 0.55) / 0.45);
          line(ctx, 26, 248, 84 - drop * 16, 264 + drop * 18, "#e0c38a", 4);
          line(ctx, 154 + drop * 12, 264 + drop * 20, 214, 248, "#c9a46a", 4);
          textCenter(ctx, "ЩЁЛК!", 120, 196, { size: 22, color: C.pink, shadowColor: "#3b2618" });
          for (let i = 0; i < 8; i += 1) {
            const angle = (i / 8) * Math.PI * 2;
            fill(
              ctx,
              120 + Math.cos(angle) * (12 + drop * 34),
              248 + Math.sin(angle) * (8 + drop * 22),
              3,
              3,
              i % 2 ? C.paper : C.amber
            );
          }
        }

        fill(ctx, 22, 214, 18, 40, "#3b7ed6");
        fill(ctx, 27, 196, 10, 18, "#f0b98b");
        fill(ctx, 25, 192, 13, 5, "#ffd447");
        fill(ctx, 14, 218, 8, 7, "#f0b98b");
        fill(ctx, 40, 218, 9, 7, "#f0b98b");
        fill(ctx, 22, 254, 7, 19, "#26395f");
        fill(ctx, 34, 254, 7, 19, "#26395f");

        fill(ctx, 196, 204, 24, 50, "#7b4a3a");
        fill(ctx, 203, 182, 12, 22, "#d69b6d");
        fill(ctx, 200, 178, 18, 6, "#3b2a28");
        fill(ctx, 188, 210, 8, 8, "#d69b6d");
        fill(ctx, 220, 210, 8, 8, "#d69b6d");
        fill(ctx, 196, 254, 9, 22, "#2b2438");
        fill(ctx, 211, 254, 9, 22, "#2b2438");

        if (!snap) {
          line(ctx, 26, 230, 62, 182, "rgba(255,246,229,0.16)", 2);
          line(ctx, 214, 230, 178, 182, "rgba(255,246,229,0.16)", 2);
        }

        if (!reaction.started) {
          textCenter(ctx, "ТАП — ТЯНУТЬ", 120, 302, { size: 10, color: "rgba(70,45,28,0.72)" });
          circle(ctx, 120, 100, 3 + Math.sin(t * 6), "rgba(255,246,229,0.45)");
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.amber);
        textCenter(ctx, "КАНАТ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "СОПЕРНИК НЕ ВСПОТЕЛ" : "ТАП — ТЯНУТЬ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        text(ctx, "1 : 0", 18, 52, { size: 9, color: "rgba(255,246,229,0.55)" });
      },
    };
  },
};
