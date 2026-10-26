import { C, fill, textCenter } from "../engine/gfx.js";
import { drawSprite } from "../engine/assets.js";
import { clamp, damp } from "../engine/utils.js";

export default {
  id: "race",
  title: "ГОНКА",
  hint: "Обгони всех. Как будто это возможно.",
  input: "sides",
  duration: 6,

  create(api) {
    const lanes = [55, 120, 185];
    const carScale = 2.5;
    const carW = 10 * carScale;
    const carH = 15 * carScale;
    const player = { lane: 1, x: lanes[1], y: 244 };

    const traffic = [
      { lane: 0, y: -85, color: "#3b7ed6" },
      { lane: 1, y: -25, color: "#ffd447" },
      { lane: 2, y: -145, color: "#4fc45c" },
      { lane: 0, y: -252, color: "#e8473f", row: true },
      { lane: 1, y: -252, color: "#a463e8", row: true },
      { lane: 2, y: -252, color: "#f39433", row: true },
    ];

    let t = 0;
    let scroll = 0;
    let crashed = false;
    let crashT = 0;
    let crashPoint = { x: 120, y: 250 };
    let reported = false;

    const carBox = (x, y) => ({ x: x - carW / 2, y, w: carW, h: carH });
    const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    function crashAt(x, y) {
      if (crashed) return;
      crashed = true;
      crashPoint = { x, y };
      api.audio.crash();
    }

    return {
      update(dt) {
        t += dt;

        if (crashed) {
          crashT += dt;
          if (crashT > 0.95 && !reported) {
            reported = true;
            api.lose("Все полосы заняты. Обгон невозможен.");
          }
          return;
        }

        scroll += dt * 150;
        player.x = damp(player.x, lanes[player.lane], 17, dt);

        const playerBox = carBox(player.x, player.y);

        for (const car of traffic) {
          car.y += dt * (car.row ? 118 : 116);
          const box = carBox(lanes[car.lane], car.y);
          if (hit(playerBox, box)) {
            crashAt((player.x + lanes[car.lane]) / 2, Math.max(player.y, car.y) + 8);
            break;
          }
        }
      },

      press(action) {
        if (crashed) return;
        if (action.type === "left") {
          player.lane = clamp(player.lane - 1, 0, 2);
          api.audio.ui();
        } else if (action.type === "right") {
          player.lane = clamp(player.lane + 1, 0, 2);
          api.audio.ui();
        }
      },

      draw(ctx) {
        fill(ctx, 0, 0, 240, 320, "#163a2d");
        fill(ctx, 0, 0, 240, 16, "#102a22");

        const roadX = 22;
        const roadW = 196;
        fill(ctx, roadX, 0, roadW, 320, "#2d2a3d");
        fill(ctx, roadX, 0, 5, 320, "#e8dfc9");
        fill(ctx, 240 - roadX - 5, 0, 5, 320, "#e8dfc9");

        for (let x = 38; x < 218; x += 34) {
          fill(ctx, x, (scroll * 0.4) % 30 - 30, 2, 14, "rgba(255,255,255,0.035)");
          fill(ctx, x + 17, (scroll * 0.65) % 26 - 13, 1, 10, "rgba(255,255,255,0.03)");
        }

        for (const divider of [87, 152]) {
          for (let y = -40; y < 340; y += 44) {
            const yy = y + (scroll % 44);
            fill(ctx, divider - 1, yy, 3, 18, "rgba(255,246,229,0.62)");
          }
        }

        for (let y = -30; y < 340; y += 46) {
          const yy = (y + scroll * 0.8) % 360;
          fill(ctx, 8, yy, 8, 16, "#1e4a36");
          fill(ctx, 224, yy + 12, 8, 16, "#1e4a36");
        }

        textCenter(ctx, "ОБГОН ЗАПРЕЩЁН", 120, 20, { size: 10, color: "rgba(255,246,229,0.6)" });

        const sorted = [...traffic].sort((a, b) => a.y - b.y);
        for (const car of sorted) {
          if (car.y > 330 || car.y < -80) continue;
          const x = lanes[car.lane];
          drawSprite(ctx, "car", x - carW / 2, car.y, { scale: carScale, paint: car.color });
          if (car.row) {
            fill(ctx, x - 7, car.y - 3, 14, 4, "#ff5577");
          }
        }

        if (!crashed) {
          drawSprite(ctx, "car", player.x - carW / 2, player.y, {
            scale: carScale,
            paint: "#e8473f",
          });
          fill(ctx, player.x - 4, player.y + carH - 4, 8, 3, "#fff6e5");
        }

        const speed = crashed ? 0 : 1;
        for (let i = 0; i < 8; i += 1) {
          const x = 30 + ((i * 47) % 180);
          const y = ((scroll * (1 + (i % 3) * 0.35) + i * 53) % 340) - 20;
          fill(ctx, x, y, 1, 10 + (i % 3) * 6, `rgba(255,255,255,${0.11 * speed})`);
        }

        if (crashed) {
          ctx.save();
          if (crashT < 0.55) {
            ctx.translate((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
          }

          const pulse = 1 - Math.min(1, crashT / 0.55);
          for (let r = 40; r > 4; r -= 7) {
            ctx.globalAlpha = 0.12 + (r / 40) * 0.2;
            fill(ctx, crashPoint.x - r / 2, crashPoint.y - r / 2, r, r, r % 14 === 5 ? C.amber : C.red);
          }
          ctx.globalAlpha = 1;

          textCenter(ctx, "БАМ!", crashPoint.x, crashPoint.y - 50, {
            size: 24 + Math.round(pulse * 8),
            color: C.amber,
            shadowColor: "#4d131d",
          });

          for (let i = 0; i < 7; i += 1) {
            const angle = (i / 7) * Math.PI * 2 + crashT * 3;
            const dist = 22 + crashT * 36;
            fill(
              ctx,
              crashPoint.x + Math.cos(angle) * dist,
              crashPoint.y + Math.sin(angle) * dist,
              3,
              3,
              i % 2 ? C.amber : C.paper
            );
          }
          ctx.restore();
        }
      },
    };
  },
};
