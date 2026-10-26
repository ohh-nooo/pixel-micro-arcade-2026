import { C, fill, textCenter, line, circle, panel, box } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "golf",
  title: "ГОЛЬФ",
  hint: "Один удар. Лунка уже больше.",
  input: "tap",
  duration: 5.4,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1.2,
      reason: "Мяч попал в лунку. Лунка оказалась бездонной.",
      sound: "pop",
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

        const sky = ctx.createLinearGradient(0, 0, 0, 190);
        sky.addColorStop(0, "#72c4e8");
        sky.addColorStop(1, "#d8f1e4");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 240, 190);

        circle(ctx, 198, 50, 17, "#ffe17a");
        for (let i = 0; i < 3; i += 1) {
          fill(ctx, 18 + i * 78, 58 + i * 16, 30, 4, "rgba(255,255,255,0.65)");
          fill(ctx, 28 + i * 78, 54 + i * 16, 12, 4, "rgba(255,255,255,0.65)");
        }

        fill(ctx, 0, 170, 240, 150, "#4f9b55");
        fill(ctx, 0, 170, 240, 5, "#6ebc6b");
        for (let i = 0; i < 8; i += 1) {
          line(ctx, i * 36, 248, i * 36 - 24, 320, "rgba(40,100,50,0.16)", 1);
        }

        fill(ctx, 72, 206, 24, 6, "#3a6d42");
        fill(ctx, 68, 232, 32, 5, "#3a6d42");
        fill(ctx, 76, 196, 9, 36, "#2d7b45");
        fill(ctx, 81, 190, 9, 10, "#f0b98b");
        fill(ctx, 79, 186, 13, 5, "#e8473f");
        fill(ctx, 85, 211, 17, 4, "#f0b98b");
        line(ctx, 101, 212, 126, 244, "#c9a46a", 2);

        fill(ctx, 174, 156, 3, 66, "#c9c3b4");
        fill(ctx, 177, 156, 26, 15, "#e8473f");
        fill(ctx, 180, 159, 20, 3, "#ff8b83");

        const holeY = 222;
        ctx.fillStyle = "#10221a";
        ctx.beginPath();
        ctx.ellipse(178, holeY, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        let ballX = 126;
        let ballY = 252;
        let ballScale = 1;
        if (reaction.started) {
          const travel = Math.min(1, p / 0.62);
          ballX = 126 + (178 - 126) * travel;
          ballY = 252 + (holeY - 252) * travel - Math.sin(travel * Math.PI) * 46;
          ballScale = 1 - travel * 0.35;
          if (p > 0.62) {
            const sink = (p - 0.62) / 0.38;
            ballX = 178;
            ballY = holeY + sink * sink * 44;
            ballScale = 1.3;
          }
        }

        circle(ctx, ballX, ballY, 8 * ballScale, "#fff6e5");
        circle(ctx, ballX - 2, ballY - 3, 2, "rgba(180,180,160,0.45)");

        if (reaction.started && p > 0.62) {
          circle(ctx, 178, holeY + 4, 20 + p * 14, "rgba(8,16,12,0.2)");
          textCenter(ctx, "ВГЛУБЬ", 178, 194, { size: 16, color: C.amber, shadowColor: "#1a2a20" });
          for (let i = 0; i < 6; i += 1) {
            const angle = (i / 6) * Math.PI * 2;
            fill(
              ctx,
              178 + Math.cos(angle) * (24 + p * 30),
              holeY + Math.sin(angle) * (10 + p * 18),
              3,
              3,
              i % 2 ? C.paper : "#8ae08a"
            );
          }
        }

        if (!reaction.started) {
          box(ctx, 62, 66, 116, 24, "#2d4f64", C.ink, 2);
          textCenter(ctx, "ПАР 3", 120, 71, { size: 10, color: C.paper });
          textCenter(ctx, "ТАП — УДАР", 120, 302, { size: 10, color: "rgba(255,246,229,0.82)" });
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.green);
        textCenter(ctx, "ГОЛЬФ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "ЛУНКА БЕЗ ДНА" : "ТАП — УДАРИТЬ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );
      },
    };
  },
};
