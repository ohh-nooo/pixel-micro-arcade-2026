import { C, fill, text, textCenter, line, panel, circle } from "../engine/gfx.js";
import { clamp, easeOutCubic } from "../engine/utils.js";

export default {
  id: "fishing",
  title: "РЫБАЛКА",
  hint: "Подсеки, пока клюёт. Рыба уже ждёт.",
  input: "tap",
  duration: 6,

  create(api) {
    const bobber = { x: 156, y: 185 };
    const rodTip = { x: 72, y: 236 };
    const angler = { x: 54, y: 258 };

    let t = 0;
    let state = "wait";
    let stateT = 0;
    let reported = false;

    function strike() {
      if (state !== "wait") return;
      state = "reel";
      stateT = 0;
      api.audio.select();
    }

    function drawFish(ctx, x, y, scale, color, flip = false) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flip ? -scale : scale, scale);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 19, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-17, 0);
      ctx.lineTo(-32, -10);
      ctx.lineTo(-32, 10);
      ctx.closePath();
      ctx.fill();
      fill(ctx, 7, -4, 3, 3, "#fff6e5");
      fill(ctx, 8, -4, 1, 1, C.ink);
      fill(ctx, 2, -1, 1, 4, "rgba(0,0,0,0.22)");
      ctx.restore();
    }

    function drawAngler(ctx, panic) {
      const x = angler.x;
      const y = angler.y;
      const wobble = panic ? Math.sin(t * 24) * 2 : 0;

      ctx.save();
      ctx.translate(wobble, 0);
      fill(ctx, x - 11, y + 20, 22, 7, "#4a3526");
      fill(ctx, x - 8, y + 26, 16, 4, "#2d2118");

      fill(ctx, x - 7, y - 2, 14, 24, "#3b7ed6");
      fill(ctx, x - 7, y + 6, 14, 5, "#d9e7ff");
      fill(ctx, x - 6, y - 15, 12, 13, "#f0b98b");
      fill(ctx, x - 8, y - 18, 16, 5, "#e8473f");
      fill(ctx, x - 12, y - 16, 8, 3, "#e8473f");
      fill(ctx, x - 3, y - 11, 2, 2, C.ink);
      fill(ctx, x + 3, y - 11, 2, 2, C.ink);

      if (panic) {
        fill(ctx, x - 12, y - 16, 4, 14, "#f0b98b");
        fill(ctx, x + 8, y - 16, 4, 14, "#f0b98b");
      } else {
        fill(ctx, x + 6, y + 2, 15, 4, "#f0b98b");
      }

      fill(ctx, x - 7, y + 22, 5, 8, "#2b3c66");
      fill(ctx, x + 2, y + 22, 5, 8, "#2b3c66");
      ctx.restore();
    }

    return {
      update(dt) {
        t += dt;
        stateT += dt;

        if (state === "wait" && t > 3.7) strike();

        if (state === "reel" && stateT > 1) {
          state = "snap";
          stateT = 0;
          api.audio.crash();
        }

        if (state === "snap" && stateT > 0.8 && !reported) {
          reported = true;
          api.lose("Рыба оказалась сильнее. Удочка ушла на дно.");
        }
      },

      press(action) {
        if (action.type === "tap") strike();
      },

      draw(ctx) {
        const sky = ctx.createLinearGradient(0, 0, 0, 168);
        sky.addColorStop(0, "#27325f");
        sky.addColorStop(0.62, "#805483");
        sky.addColorStop(1, "#e39368");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 240, 168);

        circle(ctx, 190, 58, 19, "rgba(255,214,120,0.28)");
        circle(ctx, 190, 58, 11, "#ffd06a");

        for (let i = 0; i < 4; i += 1) {
          const x = ((i * 73 + t * 4) % 300) - 30;
          const y = 42 + (i % 2) * 23;
          fill(ctx, x, y, 34, 4, "rgba(255,246,229,0.18)");
          fill(ctx, x + 8, y - 4, 16, 4, "rgba(255,246,229,0.18)");
        }

        fill(ctx, 0, 132, 240, 36, "#243d50");
        fill(ctx, 0, 150, 90, 18, "#2d4b5c");
        fill(ctx, 150, 140, 90, 28, "#2d4b5c");

        const water = ctx.createLinearGradient(0, 168, 0, 320);
        water.addColorStop(0, "#2b7b90");
        water.addColorStop(1, "#123f5b");
        ctx.fillStyle = water;
        ctx.fillRect(0, 168, 240, 152);

        for (let i = 0; i < 9; i += 1) {
          const y = 178 + i * 15;
          const offset = Math.sin(t * 1.3 + i) * 10;
          fill(ctx, 12 + offset, y, 46 + (i % 3) * 18, 2, "rgba(211,246,255,0.16)");
          fill(ctx, 142 - offset, y + 5, 60 - (i % 4) * 8, 1, "rgba(211,246,255,0.1)");
        }

        for (let i = 0; i < 12; i += 1) {
          const x = (i * 37 + 9) % 240;
          const y = 250 + ((i * 23) % 66);
          fill(ctx, x, y, 2, 2, "rgba(0,20,35,0.24)");
        }

        if (state === "wait") {
          const fishX = 168 + Math.sin(t * 1.1) * 17;
          const fishY = 234 + Math.sin(t * 2.3) * 3;
          drawFish(ctx, fishX, fishY, 1.05, "rgba(7,32,45,0.45)");
        }

        if (state === "reel") {
          const p = clamp(stateT, 0, 1);
          const fishX = 156 + Math.sin(t * 12) * 8;
          const fishY = 234 - easeOutCubic(p) * 38;
          drawFish(ctx, fishX, fishY, 1.2 + p * 0.7, "#0d2a3a");
          for (let i = 0; i < 3; i += 1) {
            const r = 8 + i * 7;
            ctx.strokeStyle = `rgba(211,246,255,${0.35 - i * 0.08})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(156, 190, r, r * 0.28, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        if (state === "snap") {
          const p = clamp(stateT / 0.8, 0, 1);
          const fishX = 162;
          const fishY = 170 - Math.sin(p * Math.PI) * 46;
          drawFish(ctx, fishX, fishY, 2.3, "#183d52", true);
          line(ctx, 162, fishY + 10, 208, fishY + 62, "#c9a46a", 3);
          textCenter(ctx, "ВЖУХ!", 162, fishY - 34, {
            size: 20,
            color: C.amber,
            shadowColor: "#0b1420",
          });
          for (let i = 0; i < 8; i += 1) {
            const angle = (i / 8) * Math.PI * 2 + t * 2;
            fill(
              ctx,
              156 + Math.cos(angle) * (18 + p * 24),
              186 + Math.sin(angle) * (9 + p * 14),
              3,
              3,
              i % 2 ? C.paper : "#9edcf0"
            );
          }
        }

        fill(ctx, 0, 280, 120, 40, "#4b3425");
        for (let i = 0; i < 6; i += 1) {
          fill(ctx, i * 22 - 4, 280, 26, 7, i % 2 ? "#6b4b31" : "#79583a");
          fill(ctx, i * 22 - 4, 287, 26, 2, "#38251b");
        }
        fill(ctx, 0, 280, 120, 4, "#9a7650");
        for (let i = 0; i < 3; i += 1) {
          fill(ctx, 12 + i * 35, 296, 5, 24, "#2a1d16");
        }

        if (state !== "snap") {
          line(ctx, 60, 246, rodTip.x, rodTip.y, "#c9a46a", 2);
          fill(ctx, rodTip.x - 1, rodTip.y - 1, 3, 3, "#e8cf9a");
        }

        drawAngler(ctx, state === "snap");

        if (state === "wait") {
          line(ctx, rodTip.x, rodTip.y, bobber.x, bobber.y, "rgba(255,246,229,0.7)", 1);
          line(ctx, rodTip.x, rodTip.y, bobber.x - 3, bobber.y + 1, "rgba(255,246,229,0.25)", 1);
          fill(ctx, bobber.x - 3, bobber.y - 4, 7, 9, "#e8473f");
          fill(ctx, bobber.x - 2, bobber.y - 4, 3, 4, "#fff6e5");
          const ripple = 5 + Math.sin(t * 4) * 2;
          ctx.strokeStyle = "rgba(211,246,255,0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(bobber.x, bobber.y + 6, ripple, ripple * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (state === "reel") {
          line(ctx, rodTip.x, rodTip.y, bobber.x, bobber.y + 14 + Math.sin(t * 20) * 3, "rgba(255,246,229,0.8)", 1);
          fill(ctx, bobber.x - 3, bobber.y + 12, 7, 8, "#e8473f");
        } else {
          line(ctx, rodTip.x, rodTip.y, 200, 252, "rgba(255,246,229,0.42)", 1);
          fill(ctx, 195, 250, 10, 4, "#c9a46a");
        }

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.blue);
        textCenter(ctx, "РЫБАЛКА", 120, 13, { size: 12, color: C.paper });
        text(
          ctx,
          state === "wait" ? "ТАП — ПОДСЕЧЬ" : state === "reel" ? "ТЯНИ!" : "СЛИШКОМ ПОЗДНО",
          120,
          29,
          { size: 9, color: state === "snap" ? "#ffb3c1" : "#d7cdf0", align: "center" }
        );

        if (state === "wait" && Math.sin(t * 6) > 0) {
          textCenter(ctx, "КЛЮЁТ...", 120, 306, { size: 9, color: "rgba(255,246,229,0.7)" });
        }
      },
    };
  },
};
