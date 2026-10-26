import { C, fill, textCenter, panel, line, circle } from "../engine/gfx.js";
import { clamp, easeOutCubic, pulse } from "../engine/utils.js";

export default {
  id: "balloon",
  title: "ШАРИК",
  hint: "Накачай шарик. Только не перестарайся.",
  input: "tap",
  duration: 5.6,

  create(api) {
    let t = 0;
    let state = "wait";
    let stateT = 0;
    let reported = false;

    function pump() {
      if (state !== "wait") return;
      state = "pump";
      stateT = 0;
      api.audio.pop();
    }

    return {
      update(dt) {
        t += dt;
        stateT += dt;

        if (state === "wait" && t > 3.5) pump();

        if (state === "pump" && stateT > 1) {
          state = "pop";
          stateT = 0;
          api.audio.explode();
        }

        if (state === "pop" && stateT > 0.7 && !reported) {
          reported = true;
          api.lose("Шарик лопнул. Внутри оказалась иголка.");
        }
      },

      press(action) {
        if (action.type === "tap") pump();
      },

      draw(ctx) {
        const sky = ctx.createLinearGradient(0, 0, 0, 320);
        sky.addColorStop(0, "#5eb8df");
        sky.addColorStop(0.62, "#a8e6f0");
        sky.addColorStop(1, "#f7f0cf");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 240, 320);

        circle(ctx, 40, 62, 20, "rgba(255,240,150,0.35)");
        circle(ctx, 40, 62, 11, "#ffe17a");

        for (let i = 0; i < 4; i += 1) {
          const x = ((i * 79 + t * 7) % 310) - 36;
          const y = 52 + (i % 2) * 34;
          fill(ctx, x, y, 36, 5, "rgba(255,255,255,0.7)");
          fill(ctx, x + 8, y - 5, 18, 5, "rgba(255,255,255,0.7)");
          fill(ctx, x + 27, y + 5, 15, 5, "rgba(255,255,255,0.55)");
        }

        fill(ctx, 0, 276, 240, 44, "#79b45d");
        fill(ctx, 0, 276, 240, 4, "#a1d47d");
        for (let i = 0; i < 12; i += 1) {
          fill(ctx, (i * 31 + 5) % 240, 287 + (i % 3) * 8, 4, 2, "rgba(35,80,42,0.35)");
        }

        const inflation = state === "pump" ? easeOutCubic(clamp(stateT / 1, 0, 1)) : 0;
        const radius = 20 + inflation * 20;
        const balloonY = 142 - inflation * 4;

        if (state !== "pop") {
          line(ctx, 120, balloonY + radius + 16, 120, 252, "rgba(50,58,66,0.55)", 1);
          line(ctx, 120, 252, 108, 274, "rgba(50,58,66,0.55)", 1);

          ctx.save();
          ctx.translate(120, balloonY);
          ctx.scale(1 + inflation * 0.12, 1 + inflation * 0.05);
          ctx.fillStyle = "#e84764";
          ctx.beginPath();
          ctx.ellipse(0, 0, radius, radius * 1.12, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ff8ca1";
          ctx.beginPath();
          ctx.ellipse(-6, -8, radius * 0.52, radius * 0.62, -0.35, 0, Math.PI * 2);
          ctx.fill();

          fill(ctx, -5, radius * 1.06, 10, 6, "#c72f4c");
          fill(ctx, -3, radius * 1.12, 6, 4, "#f06b82");
          ctx.restore();

          if (state === "wait" && pulse(t, 7) > 0.4) {
            textCenter(ctx, "ТАП", 120, 164, { size: 9, color: "rgba(255,255,255,0.8)" });
          }
        }

        fill(ctx, 101, 262, 38, 9, "#3c4b58");
        fill(ctx, 95, 270, 50, 7, "#26343f");
        fill(ctx, 112, 232, 16, 31, "#758a98");
        fill(ctx, 114, 234, 5, 27, "#a9bbc4");
        const handleY = state === "pump" ? 232 + Math.sin(clamp(stateT / 1, 0, 1) * Math.PI) * 12 : 220;
        fill(ctx, 116, handleY, 8, 16, "#33424f");
        fill(ctx, 104, handleY - 5, 32, 7, "#4f6270");
        fill(ctx, 113, 253, 14, 5, "#2c3a45");

        if (state === "pop") {
          const p = clamp(stateT / 0.7, 0, 1);
          for (let i = 0; i < 14; i += 1) {
            const angle = (i / 14) * Math.PI * 2 + t * 1.8;
            const dist = 12 + p * (38 + (i % 5) * 9);
            const size = i % 3 === 0 ? 4 : 3;
            fill(
              ctx,
              120 + Math.cos(angle) * dist,
              balloonY + Math.sin(angle) * dist * 0.85,
              size,
              size,
              i % 3 === 0 ? C.amber : i % 2 ? "#ff8ca1" : "#e84764"
            );
          }

          line(ctx, 148, 118, 163, 146, "#c8d4dc", 2);
          circle(ctx, 147, 116, 2, "#c8d4dc");

          textCenter(ctx, "БАХ!", 120, 134, {
            size: 34,
            color: C.amber,
            shadowColor: "#6b2a3f",
          });
          textCenter(ctx, "ИГЛА БЫЛА ВНУТРИ", 120, 174, {
            size: 9,
            color: "#7f2540",
            shadowColor: "rgba(255,255,255,0.3)",
          });
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.pink);
        textCenter(ctx, "ШАРИК", 120, 13, { size: 12, color: C.paper });
        textCenter(
          ctx,
          state === "wait" ? "ТАП — НАКАЧАТЬ" : state === "pump" ? "ЕЩЁ НЕМНОГО..." : "СЛИШКОМ МНОГО",
          120,
          29,
          { size: 9, color: state === "pop" ? "#ffb3c1" : "#d7cdf0" }
        );

        if (state === "pump") {
          const bar = clamp(stateT / 1, 0, 1);
          fill(ctx, 58, 300, 124, 8, "#26343f");
          fill(ctx, 61, 303, 118, 3, "#4e6a78");
          fill(ctx, 61, 303, Math.round(118 * bar), 3, bar > 0.8 ? C.pink : C.amber);
        }
      },
    };
  },
};
