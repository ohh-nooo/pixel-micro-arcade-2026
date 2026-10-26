import { C, fill, textCenter, line, circle, panel } from "../engine/gfx.js";
import { clamp } from "../engine/utils.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "hockey",
  title: "ХОККЕЙ",
  hint: "Забей. Голкипер — бетонная стена.",
  input: "sides",
  duration: 5.4,

  create(api) {
    let aim = 120;
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1,
      reason: "Шайба отскочила от голкипера. Он даже не заметил.",
      sound: "thud",
    });

    return {
      update(dt) {
        reaction.update(dt);
      },

      press(action) {
        if (reaction.started) return;
        if (action.type === "left") aim = clamp(aim - 22, 66, 174);
        if (action.type === "right") aim = clamp(aim + 22, 66, 174);
        if (action.type === "left" || action.type === "right") api.audio.ui();
      },

      draw(ctx) {
        const t = reaction.t;
        const p = reaction.p;

        fill(ctx, 0, 0, 240, 320, "#dcecf5");
        fill(ctx, 20, 0, 200, 320, "#f4fbff");
        for (let i = 0; i < 7; i += 1) {
          fill(ctx, 24, 28 + i * 44, 192, 1, "rgba(130,180,210,0.16)");
        }
        line(ctx, 120, 0, 120, 320, "rgba(220,60,60,0.35)", 2);
        line(ctx, 20, 110, 220, 110, "rgba(60,120,210,0.28)", 2);
        fill(ctx, 20, 310, 200, 5, "rgba(80,140,170,0.2)");

        fill(ctx, 58, 38, 124, 7, "#d8d2c2");
        fill(ctx, 58, 38, 5, 58, "#d8d2c2");
        fill(ctx, 177, 38, 5, 58, "#d8d2c2");
        fill(ctx, 58, 90, 124, 5, "#d8d2c2");

        fill(ctx, 62, 64, 116, 24, "#3b7ed6");
        fill(ctx, 74, 60, 92, 28, "#4f91e4");
        fill(ctx, 66, 92, 108, 6, "#2e5fa8");
        for (let i = 0; i < 3; i += 1) {
          fill(ctx, 78 + i * 30, 68, 10, 13, "#a9c8f0");
        }

        const goalieX = 120;
        fill(ctx, goalieX - 22, 96, 44, 22, "#e8b13d");
        fill(ctx, goalieX - 12, 90, 24, 12, "#f0b98b");
        fill(ctx, goalieX - 28, 100, 8, 26, "#c9c3b4");
        fill(ctx, goalieX + 20, 100, 8, 26, "#c9c3b4");
        fill(ctx, 74, 104, 92, 9, "rgba(40,60,90,0.25)");

        const playerX = 120;
        fill(ctx, playerX - 24, 236, 48, 25, "#d94a4a");
        fill(ctx, playerX - 14, 216, 28, 22, "#f0b98b");
        fill(ctx, playerX - 16, 210, 32, 8, "#26395f");
        fill(ctx, playerX + 7, 232, 28, 5, "#f0b98b");
        line(ctx, playerX + 30, 234, playerX + 30, 276, "#c9a46a", 3);
        fill(ctx, playerX + 24, 274, 14, 5, "#5b4333");

        const puckX = reaction.started ? 120 + (aim - 120) * Math.min(1, p * 1.6) : aim;
        const puckY = reaction.started ? 264 - Math.min(1, p * 1.6) * 142 : 264;
        circle(ctx, puckX, puckY, 7, "#151222");
        fill(ctx, puckX - 5, puckY - 1, 10, 2, "rgba(255,255,255,0.14)");

        if (reaction.started && p > 0.55) {
          const rebound = Math.min(1, (p - 0.55) / 0.45);
          const bx = 120 + Math.sin(rebound * 8) * 44;
          const by = 112 + rebound * 88;
          circle(ctx, bx, by, 7, "#151222");
          fill(ctx, bx - 5, by - 1, 10, 2, "rgba(255,255,255,0.14)");
          if (rebound > 0.4) {
            textCenter(ctx, "ОТБИЛ!", 120, 148, { size: 18, color: C.pink, shadowColor: "#102038" });
          }
          for (let i = 0; i < 6; i += 1) {
            const angle = (i / 6) * Math.PI * 2;
            fill(
              ctx,
              120 + Math.cos(angle) * (20 + rebound * 28),
              104 + Math.sin(angle) * (9 + rebound * 16),
              3,
              3,
              i % 2 ? C.amber : C.paper
            );
          }
        }

        if (!reaction.started) {
          fill(ctx, aim - 1, 276, 2, 20, C.amber);
          textCenter(ctx, "◀  ПРИЦЕЛ  ▶", 120, 302, { size: 9, color: "rgba(40,70,100,0.65)" });
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.blue);
        textCenter(ctx, "ХОККЕЙ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "СТЕНА ВЫДЕРЖАЛА" : "ВЫБЕРИ НАПРАВЛЕНИЕ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        textCenter(ctx, "0 : 0", 120, 52, { size: 10, color: "rgba(40,70,100,0.6)" });
        if (!reaction.started) {
          circle(ctx, 30, 294, 3 + Math.sin(t * 6), C.amber);
        }
      },
    };
  },
};
