import { C, fill, text, textCenter, line, circle, panel } from "../engine/gfx.js";
import { createReaction } from "../engine/reaction.js";

export default {
  id: "mine",
  title: "МИНЫ",
  hint: "Выбери клетку. Только одну.",
  input: "sides",
  duration: 5.4,

  create(api) {
    const cells = [];
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        cells.push({ x: 66 + c * 54, y: 124 + r * 54, r, c });
      }
    }

    let selected = 4;
    const reaction = createReaction(api, {
      autoAt: 3.4,
      delay: 1.1,
      reason: "Сапёр ошибся. Все клетки были заминированы.",
      sound: "explode",
    });

    return {
      update(dt) {
        reaction.update(dt);
      },

      press(action) {
        if (reaction.started) return;
        if (action.type === "left") selected = Math.max(0, selected - 1);
        if (action.type === "right") selected = Math.min(cells.length - 1, selected + 1);
        if (action.type === "left" || action.type === "right") api.audio.ui();
      },

      draw(ctx) {
        const t = reaction.t;
        const p = reaction.p;

        fill(ctx, 0, 0, 240, 320, "#3b5c46");
        for (let i = 0; i < 12; i += 1) {
          fill(ctx, (i * 47) % 240, 84 + (i * 71) % 220, 18, 3, "rgba(255,255,255,0.05)");
        }

        fill(ctx, 0, 300, 240, 20, "#2c3f35");
        fill(ctx, 0, 300, 240, 3, "#526b55");

        for (let i = 0; i < cells.length; i += 1) {
          const cell = cells[i];
          const active = i === selected && !reaction.started;
          const exploded = reaction.started;
          fill(ctx, cell.x - 23, cell.y - 23, 46, 46, "#1e2f2b");
          fill(ctx, cell.x - 20, cell.y - 20, 40, 40, active ? "#7b8f63" : "#566b54");
          fill(ctx, cell.x - 20, cell.y - 20, 40, 3, "rgba(255,255,255,0.12)");
          fill(ctx, cell.x - 4, cell.y - 4, 8, 8, "#2a3d35");
          line(ctx, cell.x - 12, cell.y + 12, cell.x + 12, cell.y + 12, "rgba(20,35,30,0.25)", 2);

          if (exploded) {
            const radius = 7 + p * 15;
            circle(ctx, cell.x, cell.y, radius, "#20151a");
            for (let k = 0; k < 6; k += 1) {
              const angle = (k / 6) * Math.PI * 2 + i;
              fill(
                ctx,
                cell.x + Math.cos(angle) * (10 + p * 22),
                cell.y + Math.sin(angle) * (9 + p * 18),
                3,
                3,
                k % 2 ? C.amber : C.red
              );
            }
          } else if (active) {
            textCenter(ctx, "?", cell.x, cell.y - 8, { size: 18, color: C.amber, shadowColor: "#1e2f2b" });
          }
        }

        if (reaction.started) {
          textCenter(ctx, "ВСЁ ЗАМИНИРОВАНО", 120, 88, {
            size: 15,
            color: C.amber,
            shadowColor: "#14221d",
          });
        }

        if (!reaction.started) {
          textCenter(ctx, "◀ ВЫБОР ▶", 120, 300, { size: 10, color: "rgba(255,246,229,0.7)" });
          circle(ctx, 24, 88, 4 + Math.sin(t * 6), "rgba(255,213,71,0.5)");
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.green);
        textCenter(ctx, "МИНЫ", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          reaction.started ? "САПЁР ОШИБСЯ" : "ВЫБЕРИ КЛЕТКУ",
          120,
          29,
          { size: 9, color: reaction.started ? "#ffb3c1" : "#d7cdf0" }
        );

        text(ctx, "10", 18, 52, { size: 9, color: "rgba(255,246,229,0.55)" });
        text(ctx, "10", 222, 52, { size: 9, color: "rgba(255,246,229,0.55)", align: "right" });
      },
    };
  },
};
