import { C, fill, text, textCenter, circle, panel } from "../engine/gfx.js";
import { drawSprite } from "../engine/assets.js";
import { clamp, damp } from "../engine/utils.js";

export default {
  id: "catch",
  title: "ЗВЕЗДОПАД",
  hint: "Поймай звезду в корзину. В корзине дырка.",
  input: "sides",
  duration: 5.5,

  create(api) {
    const groundY = 284;
    const basketY = 244;
    const basketW = 14 * 2.6;
    const basketH = 9 * 2.6;
    const starW = 9 * 2.4;
    const starH = 9 * 2.4;

    let t = 0;
    let playerX = 120;
    let targetX = 120;
    let starX = 120;
    let starY = -24;
    let state = "fall";
    let stateT = 0;
    let reported = false;
    let caught = false;

    return {
      update(dt) {
        t += dt;
        playerX = damp(playerX, targetX, 15, dt);

        if (state === "fall") {
          starY += dt * 96;
          starX = 120 + Math.sin(t * 2.2) * 38;

          const basketTop = basketY;
          if (starY + starH >= basketTop && starY < basketTop + basketH) {
            if (Math.abs(starX - playerX) < basketW / 2 + 2) {
              caught = true;
              state = "caught";
              stateT = 0;
              api.audio.pop();
            }
          }

          if (!caught && starY > groundY - 22) {
            state = "missed";
            stateT = 0;
            api.audio.thud();
          }
          return;
        }

        stateT += dt;
        if (stateT > (caught ? 0.85 : 0.65) && !reported) {
          reported = true;
          api.lose(
            caught
              ? "Корзина с дырой. Звезда провалилась насквозь."
              : "Звезда упала мимо. Но поймать её было нельзя."
          );
        }
      },

      press(action) {
        if (state !== "fall") return;
        if (action.type === "left") {
          targetX = clamp(targetX - 26, 24, 216);
          api.audio.ui();
        } else if (action.type === "right") {
          targetX = clamp(targetX + 26, 24, 216);
          api.audio.ui();
        }
      },

      draw(ctx) {
        const sky = ctx.createLinearGradient(0, 0, 0, groundY);
        sky.addColorStop(0, "#10162e");
        sky.addColorStop(0.65, "#1c2748");
        sky.addColorStop(1, "#2c3458");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 240, groundY);

        for (let i = 0; i < 22; i += 1) {
          const x = (i * 61 + 13) % 240;
          const y = (i * 37 + 14) % 190;
          const a = 0.25 + Math.sin(t * 2 + i) * 0.2;
          fill(ctx, x, y, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, `rgba(255,246,229,${a})`);
        }

        circle(ctx, 196, 54, 22, "rgba(255,246,229,0.12)");
        circle(ctx, 196, 54, 16, "#fff3c4");
        circle(ctx, 190, 49, 4, "#e4d49a");

        for (let layer = 0; layer < 3; layer += 1) {
          ctx.fillStyle = ["#1b2947", "#17233d", "#131c32"][layer];
          ctx.beginPath();
          ctx.moveTo(0, groundY);
          for (let x = 0; x <= 240; x += 20) {
            const y = groundY - 30 - layer * 12 + Math.sin((x + layer * 15) * 0.05) * (10 + layer * 4);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(240, groundY);
          ctx.closePath();
          ctx.fill();
        }

        fill(ctx, 0, groundY, 240, 320 - groundY, "#0d1423");
        fill(ctx, 0, groundY, 240, 2, "#2b3b5c");

        if (state === "fall" || state === "caught") {
          let sx = starX;
          let sy = starY;
          let scale = 2.4;
          let alpha = 1;

          if (state === "caught") {
            const p = clamp(stateT / 0.7, 0, 1);
            sy = basketY + 20 + p * 40;
            scale = 2.4 * (1 - p * 0.55);
            alpha = 1 - p * 0.35;
          }

          circle(ctx, sx, sy + 8, 15, "rgba(255,213,71,0.1)");
          for (let i = 0; i < 4; i += 1) {
            fill(ctx, sx - 10 - i * 9, sy + 6 + i * 10, 3, 3, `rgba(255,213,71,${0.5 - i * 0.1})`);
          }
          drawSprite(ctx, "star", sx - starW / 2, sy, { scale, alpha });

          if (state === "fall") {
            fill(ctx, sx - 2, groundY - 4, 5, 4, "rgba(255,213,71,0.2)");
          }
        } else if (state === "missed") {
          const p = clamp(stateT / 0.5, 0, 1);
          for (let i = 0; i < 6; i += 1) {
            const angle = (i / 6) * Math.PI * 2;
            fill(
              ctx,
              starX + Math.cos(angle) * (8 + p * 24),
              groundY - 8 + Math.sin(angle) * (4 + p * 10),
              3,
              3,
              `rgba(255,213,71,${1 - p})`
            );
          }
          textCenter(ctx, "МИМО", 120, groundY - 70, { size: 18, color: C.pink });
        }

        drawSprite(ctx, "basket", playerX - basketW / 2, basketY, { scale: 2.6 });
        ctx.fillStyle = "rgba(9,14,26,0.9)";
        ctx.beginPath();
        ctx.ellipse(playerX, basketY + 3, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        fill(ctx, playerX - basketW / 2 - 2, basketY + basketH - 3, basketW + 4, 3, "rgba(0,0,0,0.18)");
        fill(ctx, playerX - basketW / 2, basketY + basketH - 3, basketW, 2, "#8a5a3b");

        if (state === "caught") {
          textCenter(ctx, "ДЫРКА!", 120, 196, { size: 20, color: C.amber, shadowColor: "#0b1220" });
        }

        panel(ctx, 10, 8, 220, 32, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.blue);
        textCenter(ctx, "ПОЙМАЙ ЗВЕЗДУ", 120, 14, { size: 12, color: C.paper });
        text(ctx, "ЗВЁЗД: 0", 19, 29, { size: 9, color: "#d7cdf0" });
        text(ctx, "◀  ▶", 221, 29, { size: 9, color: "#d7cdf0", align: "right" });

        textCenter(ctx, "ЛОВИ", 120, 307, { size: 9, color: "rgba(255,246,229,0.6)" });
      },
    };
  },
};
