import { C, fill, text, textCenter, panel, circle } from "../engine/gfx.js";
import { clamp, easeInCubic } from "../engine/utils.js";

export default {
  id: "stacker",
  title: "БАШНЯ",
  hint: "Поставь блок ровно. Ветер уже против.",
  input: "tap",
  duration: 5.5,

  create(api) {
    const groundY = 286;
    const blockH = 22;
    const blockW = 46;
    const stack = [];
    const colors = ["#3b7ed6", "#4fc45c", "#ffd447", "#a463e8", "#f39433"];

    for (let i = 0; i < 5; i += 1) {
      const offset = [0, -3, 2, -2, 3][i];
      stack.push({
        x: 120 + offset,
        y: groundY - (i + 1) * blockH,
        w: 52,
        color: colors[i],
      });
    }

    let t = 0;
    let state = "move";
    let dropT = 0;
    let collapseT = 0;
    let blockCenter = 120;
    let landCenter = 120;
    let landingY = 0;
    let direction = 1;
    let reported = false;

    function startDrop() {
      state = "drop";
      dropT = 0;
      blockCenter = 120 + Math.sin(t * 2.3) * 48;
      direction = blockCenter <= 120 ? -1 : 1;
      landCenter = blockCenter + direction * 16;
      landingY = groundY - (stack.length + 1) * blockH;
      api.audio.pop();
    }

    function drawBlock(ctx, cx, y, w, h, color, alpha = 1) {
      const x = cx - w / 2;
      ctx.save();
      ctx.globalAlpha *= alpha;
      fill(ctx, x, y, w, h, "#100c1c");
      fill(ctx, x + 2, y + 2, w - 4, h - 4, color);
      fill(ctx, x + 3, y + 3, w - 6, 3, "rgba(255,255,255,0.35)");
      fill(ctx, x + 3, y + h - 5, w - 6, 3, "rgba(0,0,0,0.2)");
      fill(ctx, x + 3, y + 3, 3, h - 6, "rgba(255,255,255,0.14)");
      fill(ctx, x + w - 5, y + 3, 2, h - 6, "rgba(0,0,0,0.18)");
      ctx.restore();
    }

    return {
      update(dt) {
        t += dt;

        if (state === "move") {
          blockCenter = 120 + Math.sin(t * 2.3) * 48;
          if (t > 4.1) startDrop();
          return;
        }

        if (state === "drop") {
          dropT += dt;
          const p = clamp(dropT / 0.34, 0, 1);
          if (p >= 1) {
            state = "collapse";
            collapseT = 0;
            stack.push({ x: landCenter, y: landingY, w: blockW, color: C.amber });
            api.audio.thud();
          }
          return;
        }

        if (state === "collapse") {
          if (collapseT === 0) api.audio.crash();
          collapseT += dt;
          if (collapseT > 1.0 && !reported) {
            reported = true;
            api.lose("Перекос. Ветер был в кадре. Башня была обречена.");
          }
        }
      },

      press(action) {
        if (state !== "move" || action.type !== "tap") return;
        startDrop();
      },

      draw(ctx) {
        const sky = ctx.createLinearGradient(0, 0, 0, groundY);
        sky.addColorStop(0, "#2c2350");
        sky.addColorStop(0.55, "#9a4560");
        sky.addColorStop(1, "#f3a05c");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 240, groundY);

        circle(ctx, 186, 188, 26, "rgba(255,213,71,0.18)");
        circle(ctx, 186, 188, 17, "#ffd447");

        for (let i = 0; i < 6; i += 1) {
          const x = i * 44 - 10;
          const h = 34 + (i % 3) * 18;
          fill(ctx, x, groundY - h, 36, h, "#32263e");
          fill(ctx, x + 5, groundY - h + 7, 5, 7, "rgba(255,213,71,0.35)");
          fill(ctx, x + 20, groundY - h + 18, 5, 7, "rgba(255,213,71,0.15)");
        }

        fill(ctx, 0, groundY, 240, 320 - groundY, "#3a2a26");
        fill(ctx, 0, groundY, 240, 3, "#5a4038");
        fill(ctx, 0, groundY + 18, 240, 16, "#33231f");

        panel(ctx, 10, 8, 220, 34, "#2a2246");
        fill(ctx, 10, 8, 220, 3, C.amber);
        textCenter(ctx, "СТРОЙКА ВЕКА", 120, 13, { size: 12, color: C.amber });
        text(ctx, "БЛОКОВ: 5", 19, 29, { size: 9, color: "#d7cdf0" });
        text(ctx, "ВЫСОТА: 1.1 М", 221, 29, { size: 9, color: "#d7cdf0", align: "right" });

        fill(ctx, 26, 48, 188, 5, "#4d3120");
        fill(ctx, 32, 48, 6, 10, "#4d3120");
        fill(ctx, 202, 48, 6, 10, "#4d3120");

        const movingX = state === "move" ? blockCenter : landCenter;
        if (state !== "collapse") {
          fill(ctx, Math.round(movingX), 53, 1, state === "move" ? 49 : 12, "rgba(255,246,229,0.4)");
          fill(ctx, Math.round(movingX) - 4, 53, 8, 4, "#6d7385");
        }

        ctx.save();
        if (state === "collapse") {
          const angle = direction * easeInCubic(clamp(collapseT / 0.75, 0, 1)) * 0.62;
          ctx.translate(120, groundY);
          ctx.rotate(angle);
          ctx.translate(-120, -groundY);
        }

        for (const block of stack) {
          drawBlock(ctx, block.x, block.y, block.w, blockH, block.color);
        }

        if (state === "move") {
          const bob = Math.sin(t * 6) * 1;
          drawBlock(ctx, blockCenter, 104 + bob, blockW, blockH, C.amber);
        } else if (state === "drop") {
          const p = clamp(dropT / 0.34, 0, 1);
          const y = 104 + (landingY - 104) * p * p;
          drawBlock(ctx, blockCenter + (landCenter - blockCenter) * p, y, blockW, blockH, C.amber);
        }

        ctx.restore();

        if (state === "collapse") {
          textCenter(ctx, "ПЕРЕКОС!", 120, 150, {
            size: 26,
            color: C.pink,
            shadowColor: "#100c1f",
          });
          for (let i = 0; i < 10; i += 1) {
            const p = clamp(collapseT / 0.8, 0, 1);
            const angle = (i / 10) * Math.PI * 2;
            fill(
              ctx,
              120 + Math.cos(angle) * (20 + p * 70),
              groundY - 10 + Math.sin(angle) * (6 + p * 14),
              3,
              3,
              `rgba(201,194,182,${0.55 - p * 0.3})`
            );
          }
        }

        if (state === "move") {
          const blink = Math.sin(t * 7) > 0;
          if (blink) {
            textCenter(ctx, "ТАП — БРОСИТЬ", 120, 300, { size: 11, color: "#ffe28c" });
          }
        }
      },
    };
  },
};
