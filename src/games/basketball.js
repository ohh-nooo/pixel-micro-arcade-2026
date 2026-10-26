import { C, fill, text, textCenter, line, circle, panel, box } from "../engine/gfx.js";
import { clamp } from "../engine/utils.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "basketball",
  title: "БАСКЕТБОЛ",
  hint: "Бросай. Кольцо уже против тебя.",
  input: "tap",
  duration: 5.4,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1.1,
      reason: "Мяч оказался шире кольца. Судья даже не смотрел.",
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

        fill(ctx, 0, 0, 240, 320, "#2b3155");
        fill(ctx, 0, 250, 240, 70, "#c98e4f");
        fill(ctx, 0, 250, 240, 4, "#e4b06a");
        for (let i = 0; i < 9; i += 1) {
          line(ctx, 8 + i * 29, 254, 3 + i * 29, 320, "rgba(100,58,26,0.24)", 1);
        }

        fill(ctx, 42, 44, 156, 102, "rgba(10,13,30,0.45)");
        fill(ctx, 52, 36, 136, 8, "#fff6e5");
        fill(ctx, 54, 44, 132, 80, "rgba(255,246,229,0.08)");
        for (let i = 0; i < 5; i += 1) {
          fill(ctx, 58 + i * 25, 44, 2, 80, "rgba(255,246,229,0.14)");
        }

        fill(ctx, 74, 92, 92, 5, "#e8473f");
        fill(ctx, 74, 92, 5, 34, "#b93232");
        fill(ctx, 161, 92, 5, 34, "#b93232");
        fill(ctx, 74, 124, 92, 4, "#b93232");
        for (let i = 0; i < 7; i += 1) {
          line(ctx, 78 + i * 12, 96, 84 + i * 12, 121, "rgba(255,246,229,0.5)", 1);
          line(ctx, 84 + i * 12, 96, 78 + i * 12, 121, "rgba(255,246,229,0.5)", 1);
        }

        fill(ctx, 34, 206, 26, 45, "#1c2038");
        fill(ctx, 39, 186, 15, 22, "#2a2f4e");
        fill(ctx, 42, 176, 9, 14, "#f0b98b");
        fill(ctx, 41, 172, 12, 6, "#ffd447");
        fill(ctx, 59, 188, 22, 5, "#f0b98b");

        let ballX = 96;
        let ballY = 232;
        let ballR = 12;
        if (reaction.started) {
          const e = clamp(p / 0.78, 0, 1);
          ballX = 96 + (120 - 96) * e;
          ballY = 232 + (108 - 232) * e - Math.sin(e * Math.PI) * 98;
          ballR = 12 - e * 4;
          if (p > 0.78) {
            const bounce = (p - 0.78) / 0.22;
            ballX = 120 + bounce * 34;
            ballY = 108 + bounce * bounce * 78;
            ballR = 8;
          }
        }

        circle(ctx, ballX, ballY, ballR, "#e87832");
        fill(ctx, ballX - ballR, ballY - 1, ballR * 2, 2, "#6e2b18");
        fill(ctx, ballX - 1, ballY - ballR, 2, ballR * 2, "#6e2b18");

        if (reaction.started && p > 0.78) {
          textCenter(ctx, "ДЫНЬ!", 142, 118, { size: 19, color: C.amber, shadowColor: "#1a1226" });
          for (let i = 0; i < 6; i += 1) {
            const angle = (i / 6) * Math.PI * 2;
            fill(
              ctx,
              120 + Math.cos(angle) * (16 + p * 22),
              112 + Math.sin(angle) * (10 + p * 18),
              3,
              3,
              i % 2 ? C.paper : C.amber
            );
          }
        }

        if (!reaction.started) {
          box(ctx, 74, 74, 92, 27, "#332a53", C.ink, 2);
          textCenter(ctx, "0 : 0", 120, 80, { size: 10, color: C.paper });
          if (Math.sin(t * 5) > 0) {
            textCenter(ctx, "ТАП — БРОСОК", 120, 296, { size: 10, color: "rgba(80,42,18,0.72)" });
          }
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.amber);
        textCenter(ctx, "БАСКЕТБОЛ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "КОЛЬЦО МАЛОВАТО" : "ТАП — БРОСИТЬ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        text(ctx, "2", 18, 50, { size: 9, color: "rgba(255,246,229,0.5)" });
        text(ctx, "24", 222, 50, { size: 9, color: "rgba(255,246,229,0.5)", align: "right" });
      },
    };
  },
};
