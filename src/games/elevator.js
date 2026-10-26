import { C, fill, text, textCenter, line, panel, box } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "elevator",
  title: "ЛИФТ",
  hint: "Выбери этаж. Лифт выберет сам.",
  input: "sides",
  duration: 5.4,

  create(api) {
    let choice = 0;
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1.1,
      reason: "Лифт поехал вниз. Кабина решила не ехать.",
      sound: "crash",
    });

    return {
      update(dt) {
        reaction.update(dt);
      },

      press(action) {
        if (reaction.started) return;
        if (action.type === "left") choice = -1;
        if (action.type === "right") choice = 1;
        if (action.type === "left" || action.type === "right") api.audio.ui();
      },

      draw(ctx) {
        const t = reaction.t;
        const p = reaction.p;

        fill(ctx, 0, 0, 240, 320, "#18172a");
        fill(ctx, 54, 48, 132, 248, "#24213a");
        fill(ctx, 58, 52, 124, 240, "#101021");
        for (let y = 58; y < 292; y += 16) {
          fill(ctx, 58, y, 124, 1, "rgba(255,255,255,0.035)");
        }
        fill(ctx, 116, 52, 6, 240, "#34304f");

        fill(ctx, 58, 52, 6, 240, "#45405f");
        fill(ctx, 180, 52, 6, 240, "#45405f");

        for (let y = 68; y < 292; y += 34) {
          fill(ctx, 63, y, 16, 3, "rgba(255,213,71,0.18)");
          fill(ctx, 166, y + 17, 14, 3, "rgba(255,213,71,0.18)");
        }

        let cabinY = choice === -1 ? 138 : choice === 1 ? 212 : 176;
        if (reaction.started) cabinY += p * p * 128;
        const tilt = reaction.started ? Math.sin(t * 14) * p * 0.08 : 0;

        if (!reaction.started) {
          line(ctx, 120, 52, 120, cabinY - 8, "#8a7a58", 2);
          line(ctx, 120, 52, 120, cabinY - 8, "rgba(255,255,255,0.18)", 1);
        } else {
          line(ctx, 120, 52, 120, Math.min(150, cabinY - 28), "#8a7a58", 2);
          fill(ctx, 117, Math.min(150, cabinY - 28), 6, 5, "#6c5b40");
        }

        ctx.save();
        ctx.translate(120, cabinY);
        ctx.rotate(tilt);
        fill(ctx, -38, -32, 76, 64, "#100d20");
        fill(ctx, -35, -29, 70, 58, "#4c4a6a");
        fill(ctx, -30, -24, 60, 22, "#7e93a8");
        fill(ctx, -30, -24, 60, 4, "#b6c7d5");
        fill(ctx, -3, -24, 4, 22, "#5e7285");
        fill(ctx, -26, 2, 52, 24, "#3d3c58");
        fill(ctx, -10, 10, 20, 3, "#ffd447");
        for (let i = 0; i < 3; i += 1) {
          fill(ctx, -22 + i * 16, -16, 7, 7, i === 2 ? C.red : "#a6bccd");
        }
        ctx.restore();

        if (reaction.started) {
          textCenter(ctx, "ОБРЫВ!", 120, 120, { size: 22, color: C.pink, shadowColor: "#0c0b18" });
          for (let i = 0; i < 8; i += 1) {
            const angle = (i / 8) * Math.PI * 2;
            fill(
              ctx,
              120 + Math.cos(angle) * (22 + p * 48),
              cabinY + 5 + Math.sin(angle) * (18 + p * 32),
              3,
              3,
              i % 2 ? C.paper : C.amber
            );
          }
        }

        if (!reaction.started) {
          box(ctx, 192, 142, 34, 36, "#332b50", C.ink, 2);
          fill(ctx, 198, 148, 22, 10, choice === -1 ? C.amber : "#4c476b");
          fill(ctx, 204, 150, 10, 6, choice === -1 ? C.ink : "#6c668f");
          fill(ctx, 198, 162, 22, 10, choice === 1 ? C.amber : "#4c476b");
          fill(ctx, 204, 164, 10, 6, choice === 1 ? C.ink : "#6c668f");
          textCenter(ctx, "◀", 74, 300, { size: 12, color: C.amber });
          textCenter(ctx, "▶", 166, 300, { size: 12, color: C.amber });
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.mint);
        textCenter(ctx, "ЛИФТ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "КАБИНА НЕ СОГЛАСНА" : choice === 0 ? "◀ ВЫБЕРИ ЭТАЖ ▶" : choice < 0 ? "ВЫБРАН: ВВЕРХ" : "ВЫБРАН: ВНИЗ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        text(ctx, "13", 30, 260, { size: 22, color: "rgba(255,246,229,0.18)" });
      },
    };
  },
};
