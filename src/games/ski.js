import { C, fill, textCenter, text } from "../engine/gfx.js";
import { drawSprite } from "../engine/assets.js";
import { clamp, damp } from "../engine/utils.js";

export default {
  id: "ski",
  title: "СЛАЛОМ",
  hint: "Объезжай деревья. Все сразу.",
  input: "sides",
  duration: 5.5,

  create(api) {
    const lanes = [40, 82, 124, 166, 208];
    const player = { lane: 2, x: lanes[2], y: 250 };
    const playerScale = 2.4;
    const playerW = 8 * playerScale;
    const playerH = 12 * playerScale;
    const treeScale = 2.4;
    const treeW = 12 * treeScale;
    const treeH = 18 * treeScale;

    const firstX = [18, 55, 92, 129, 166, 203];
    const trees = [
      ...firstX.map((x) => ({ x, y: -74, scale: treeScale })),
      ...firstX.map((x) => ({ x: x + 18, y: -246, scale: treeScale })),
      { x: 104, y: -160, scale: treeScale },
    ];

    let t = 0;
    let scroll = 0;
    let crashed = false;
    let crashT = 0;
    let reported = false;

    const boxOf = (cx, y, w, h) => ({ x: cx - w / 2, y, w, h });
    const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    return {
      update(dt) {
        t += dt;

        if (crashed) {
          crashT += dt;
          if (crashT > 0.9 && !reported) {
            reported = true;
            api.lose("Лыжи не едут. Деревья тоже. Они вообще ехали на тебя.");
          }
          return;
        }

        scroll += dt * 105;
        player.x = damp(player.x, lanes[player.lane], 16, dt);

        const playerBox = boxOf(player.x, player.y, playerW, playerH);
        for (const tree of trees) {
          tree.y += dt * 105;
          const treeBox = boxOf(tree.x, tree.y, treeW, treeH);
          if (overlaps(playerBox, treeBox)) {
            crashed = true;
            api.audio.crash();
            break;
          }
        }
      },

      press(action) {
        if (crashed) return;
        if (action.type === "left") {
          player.lane = clamp(player.lane - 1, 0, lanes.length - 1);
          api.audio.ui();
        } else if (action.type === "right") {
          player.lane = clamp(player.lane + 1, 0, lanes.length - 1);
          api.audio.ui();
        }
      },

      draw(ctx) {
        fill(ctx, 0, 0, 240, 320, "#c4e2f2");
        fill(ctx, 18, 0, 204, 320, "#e8f5ff");

        for (let i = 0; i < 10; i += 1) {
          fill(ctx, 24 + i * 20, 0, 1, 320, "rgba(130,180,210,0.16)");
        }

        for (let i = 0; i < 7; i += 1) {
          const y = ((i * 70 + scroll * 0.6) % 420) - 60;
          fill(ctx, 20, y, 20, 3, "#b7d8ea");
          fill(ctx, 200, y + 30, 20, 3, "#b7d8ea");
        }

        for (let i = 0; i < 6; i += 1) {
          const y = ((i * 80 + scroll * 0.45) % 400) - 40;
          drawSprite(ctx, "tree", -10, y, { scale: 2 });
          drawSprite(ctx, "tree", 220, y + 38, { scale: 2 });
        }

        const sorted = [...trees].sort((a, b) => a.y - b.y);
        for (const tree of sorted) {
          if (tree.y > 320) continue;
          fill(ctx, tree.x - 12, tree.y + treeH - 4, 24, 4, "rgba(80,130,160,0.18)");
          drawSprite(ctx, "tree", tree.x - treeW / 2, tree.y, { scale: tree.scale });
        }

        for (let i = 0; i < 26; i += 1) {
          const x = (i * 53 + t * (8 + (i % 4) * 3)) % 250 - 5;
          const y = (i * 37 + t * (28 + (i % 3) * 12)) % 340 - 10;
          fill(ctx, x, y, 2, 2, "rgba(255,255,255,0.75)");
        }

        const lean = clamp((lanes[player.lane] - player.x) * 0.014, -0.22, 0.22);

        if (!crashed) {
          fill(ctx, player.x - 7, player.y + playerH - 2, 14, 2, "rgba(70,100,130,0.22)");
          ctx.save();
          ctx.translate(player.x, player.y + playerH / 2);
          ctx.rotate(lean);
          drawSprite(ctx, "skier", -playerW / 2, -playerH / 2, { scale: playerScale, paint: "#ff5577" });
          ctx.restore();

          fill(ctx, player.x - 6, player.y + playerH, 1, 16, "rgba(120,170,200,0.35)");
          fill(ctx, player.x + 5, player.y + playerH, 1, 16, "rgba(120,170,200,0.35)");
        } else {
          const p = Math.min(1, crashT / 0.7);
          ctx.save();
          ctx.translate(player.x, player.y + playerH / 2 + p * 8);
          ctx.rotate(crashT * 7);
          drawSprite(ctx, "skier", -playerW / 2, -playerH / 2, {
            scale: playerScale,
            paint: "#ff5577",
          });
          ctx.restore();

          for (let i = 0; i < 8; i += 1) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 10 + p * 34;
            fill(
              ctx,
              player.x + Math.cos(angle) * dist,
              player.y + Math.sin(angle) * dist,
              3,
              3,
              "rgba(255,255,255,0.85)"
            );
          }

          textCenter(ctx, "ШЛЁП!", player.x, player.y - 42, {
            size: 22,
            color: C.pink,
            shadowColor: "#1f3a4a",
          });
        }

        fill(ctx, 4, 294, 72, 20, "rgba(22,40,52,0.72)");
        text(ctx, "50 КМ/Ч", 10, 299, { size: 9, color: "#e5f6ff", shadow: false });
        textCenter(ctx, "◀  ▶", 120, 297, { size: 12, color: "rgba(220,245,255,0.72)" });
      },
    };
  },
};
