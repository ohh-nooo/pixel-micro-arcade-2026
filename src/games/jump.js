import { C, fill, textCenter, circle } from "../engine/gfx.js";
import { drawSprite } from "../engine/assets.js";
import { clamp } from "../engine/utils.js";

export default {
  id: "jump",
  title: "ПРЫЖОК",
  hint: "Перепрыгни кактус. Одним нажатием.",
  input: "tap",
  duration: 5.5,

  create(api) {
    const groundY = 268;
    const playerX = 54;
    const playerScale = 2.4;
    const playerW = 8 * playerScale;
    const playerH = 12 * playerScale;
    const cactusScale = 3.2;
    const cactusW = 8 * cactusScale;
    const cactusH = 14 * cactusScale;

    let t = 0;
    let scroll = 0;
    let jumpHeight = 0;
    let vy = 0;
    let jumping = false;
    let jumped = false;
    let hit = false;
    let hitT = 0;
    let obstacleX = 278;
    let reported = false;

    function obstacleBox() {
      return {
        x: obstacleX,
        y: groundY - cactusH,
        w: cactusW,
        h: cactusH,
      };
    }

    function playerBox() {
      return {
        x: playerX,
        y: groundY - playerH - jumpHeight,
        w: playerW,
        h: playerH,
      };
    }

    function overlaps(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    return {
      update(dt) {
        t += dt;
        scroll += dt * 95;

        if (hit) {
          hitT += dt;
          if (hitT > 0.9 && !reported) {
            reported = true;
            api.lose(
              jumped
                ? "Прыжок оказался слишком низким. Кактус был выше."
                : "Ты даже не прыгнул. Впрочем, это бы не помогло."
            );
          }
          return;
        }

        if (jumping) {
          vy -= 950 * dt;
          jumpHeight += vy * dt;
          if (jumpHeight <= 0) {
            jumpHeight = 0;
            vy = 0;
            jumping = false;
          }
        }

        obstacleX -= dt * 105;

        if (overlaps(playerBox(), obstacleBox())) {
          hit = true;
          api.audio.thud();
          return;
        }

        if (obstacleX < -40) {
          api.lose("Кактус прошёл мимо, но финиш всё равно отменили.");
        }
      },

      press() {
        if (hit || jumping) return;
        jumping = true;
        jumped = true;
        vy = 178;
        api.audio.pop();
      },

      draw(ctx) {
        const sky = ctx.createLinearGradient(0, 0, 0, groundY);
        sky.addColorStop(0, "#5aaee8");
        sky.addColorStop(0.58, "#a8ddf0");
        sky.addColorStop(1, "#ffe0a8");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 240, groundY);

        circle(ctx, 198, 54, 20, "#ffe36e");
        circle(ctx, 198, 54, 14, "#fff3a8");

        for (let i = 0; i < 3; i += 1) {
          const cx = ((i * 103 - scroll * 0.12) % 320) - 40;
          fill(ctx, cx, 74 + i * 18, 26, 6, "rgba(255,255,255,0.75)");
          fill(ctx, cx + 7, 68 + i * 18, 12, 6, "rgba(255,255,255,0.75)");
        }

        const hills = ["#8fbf9a", "#6ba57d"];
        for (let layer = 0; layer < 2; layer += 1) {
          for (let i = -1; i < 6; i += 1) {
            const x = i * 64 - ((scroll * (0.12 + layer * 0.1)) % 64);
            const base = 210 + layer * 14;
            ctx.fillStyle = hills[layer];
            ctx.beginPath();
            ctx.moveTo(x, base);
            ctx.lineTo(x + 32, base - 26 - layer * 8);
            ctx.lineTo(x + 64, base);
            ctx.closePath();
            ctx.fill();
          }
        }

        fill(ctx, 0, groundY, 240, 320 - groundY, "#d7a45c");
        fill(ctx, 0, groundY, 240, 5, "#b77f3f");
        fill(ctx, 0, groundY + 5, 240, 3, "#edc07d");

        for (let i = 0; i < 12; i += 1) {
          const x = (i * 37 - scroll) % 280;
          fill(ctx, x, groundY + 18 + (i % 4) * 9, 4 + (i % 3) * 2, 2, "rgba(90,50,20,0.22)");
        }

        for (let i = 0; i < 5; i += 1) {
          const x = (i * 71 - scroll * 0.7 + 40) % 300;
          fill(ctx, x, groundY - 10, 2, 10, "#b68648");
        }

        const cactusBob = hit ? Math.sin(hitT * 40) * 2 : 0;
        drawSprite(ctx, "cactus", obstacleX, groundY - cactusH + cactusBob, { scale: cactusScale });

        const dustAlpha = jumping ? 0.5 : 0.22;
        for (let i = 0; i < 3; i += 1) {
          const px = playerX - 6 - i * 6 - ((scroll * 2) % 10);
          const py = groundY - 4 - (i % 2) * 3;
          fill(ctx, px, py, 4 - i, 3, `rgba(120,80,40,${dustAlpha})`);
        }

        if (!hit) {
          const bob = jumping ? 0 : Math.sin(t * 18) * 1;
          drawSprite(ctx, "runner", playerX, groundY - playerH - jumpHeight + bob, {
            scale: playerScale,
            paint: "#3b7ed6",
          });

          if (jumping) {
            fill(ctx, playerX + 3, groundY - jumpHeight - 4, 12, 2, "rgba(255,255,255,0.4)");
          }
        } else {
          ctx.save();
          ctx.translate(playerX + playerW / 2, groundY - 8);
          ctx.rotate(Math.min(1.4, hitT * 5));
          drawSprite(ctx, "runner", -playerW / 2, -playerH, {
            scale: playerScale,
            paint: "#3b7ed6",
            alpha: 0.95,
          });
          ctx.restore();

          textCenter(ctx, "БАМ!", playerX + 52, groundY - 120, {
            size: 26,
            color: C.amber,
            shadowColor: "#5b2a12",
          });

          for (let i = 0; i < 6; i += 1) {
            const angle = (i / 6) * Math.PI * 2 + hitT * 2;
            const dist = 18 + hitT * 30;
            fill(
              ctx,
              obstacleX + cactusW / 2 + Math.cos(angle) * dist,
              groundY - cactusH / 2 + Math.sin(angle) * dist,
              3,
              3,
              i % 2 ? C.paper : C.amber
            );
          }
        }

        textCenter(ctx, "ТАП — ПРЫЖОК", 64, 292, { size: 10, color: "rgba(70,38,14,0.68)" });
      },
    };
  },
};
