import { C, fill, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "clock",
  title: "ЧАСЫ",
  hint: "Останови стрелки ровно в полночь.",
  input: "tap",
  duration: 5.2,

  create(api) {
    const reaction = createReaction(api, {
      autoAt: 3.3,
      delay: 1.1,
      reason: "Стрелки не остановились. Полночь наступила дважды.",
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

        fill(ctx, 0, 0, 240, 320, "#1a1730");
        for (let i = 0; i < 8; i += 1) {
          fill(ctx, 14 + i * 30, 0, 1, 320, "rgba(255,255,255,0.03)");
        }

        circle(ctx, 120, 164, 92, "#100d20");
        circle(ctx, 120, 164, 86, "#2c2850");
        circle(ctx, 120, 164, 78, "#e9dfc9");
        circle(ctx, 120, 164, 72, "#fbf2dd");
        for (let i = 0; i < 12; i += 1) {
          const angle = (i / 12) * Math.PI * 2;
          const r1 = i % 3 === 0 ? 56 : 61;
          line(
            ctx,
            120 + Math.cos(angle) * r1,
            164 + Math.sin(angle) * r1,
            120 + Math.cos(angle) * 67,
            164 + Math.sin(angle) * 67,
            "#3c3457",
            i % 3 === 0 ? 3 : 1
          );
        }

        textCenter(ctx, "12", 120, 94, { size: 13, color: "#3c3457", shadow: false });
        textCenter(ctx, "3", 190, 157, { size: 13, color: "#3c3457", shadow: false });
        textCenter(ctx, "6", 120, 212, { size: 13, color: "#3c3457", shadow: false });
        textCenter(ctx, "9", 50, 157, { size: 13, color: "#3c3457", shadow: false });

        const speed = reaction.started ? 18 : 2.2;
        const minuteAngle = t * speed - Math.PI / 2;
        const hourAngle = t * (speed / 12) - Math.PI / 2;
        line(ctx, 120, 164, 120 + Math.cos(hourAngle) * 36, 164 + Math.sin(hourAngle) * 36, "#3b315c", 7);
        line(ctx, 120, 164, 120 + Math.cos(minuteAngle) * 58, 164 + Math.sin(minuteAngle) * 58, "#e8473f", 4);
        circle(ctx, 120, 164, 6, "#3b315c");
        circle(ctx, 120, 164, 3, C.amber);

        fill(ctx, 30, 62, 15, 22, "#5a456e");
        fill(ctx, 28, 76, 19, 8, "#46375b");
        fill(ctx, 195, 62, 15, 22, "#5a456e");
        fill(ctx, 193, 76, 19, 8, "#46375b");

        if (reaction.started) {
          const crack = Math.min(1, p * 2);
          for (let i = 0; i < 5; i += 1) {
            const angle = i * 1.3 + 0.4;
            line(
              ctx,
              120,
              164,
              120 + Math.cos(angle) * (72 * crack),
              164 + Math.sin(angle) * (72 * crack),
              "rgba(35,26,58,0.55)",
              2
            );
          }
          textCenter(ctx, "ДЗЫНЬ!", 120, 254, { size: 26, color: C.pink, shadowColor: "#100d20" });
          for (let i = 0; i < 9; i += 1) {
            const angle = (i / 9) * Math.PI * 2;
            const dist = 20 + p * 58;
            fill(
              ctx,
              120 + Math.cos(angle) * dist,
              164 + Math.sin(angle) * dist,
              3,
              3,
              i % 2 ? C.paper : C.amber
            );
          }
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.amber);
        textCenter(ctx, "ЧАСЫ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "ПОЛНОЧЬ НАСТУПИЛА" : "ТАП — ОСТАНОВИТЬ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        textCenter(ctx, "00:00", 120, 286, {
          size: 12,
          color: reaction.started ? C.pink : "rgba(255,246,229,0.6)",
        });
      },
    };
  },
};
