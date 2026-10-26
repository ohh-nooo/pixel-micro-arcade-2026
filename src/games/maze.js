import { C, fill, text, textCenter } from "../engine/gfx.js";
import { clamp } from "../engine/utils.js";

export default {
  id: "maze",
  title: "ЛАБИРИНТ",
  hint: "На развилке выбери направление. Любое.",
  input: "sides",
  duration: 6,

  create(api) {
    const player = { x: 120, y: 300 };
    const forkY = 172;
    const branchY = 120;

    let t = 0;
    let state = "run";
    let stateT = 0;
    let forkT = 0;
    let queued = null;
    let dir = 0;
    let hitT = 0;
    let reported = false;

    function enterBranch(choice) {
      dir = choice;
      state = "branch";
      stateT = 0;
      api.audio.ui();
    }

    function hitSpikes() {
      state = "hit";
      hitT = 0;
      api.audio.thud();
    }

    return {
      update(dt) {
        t += dt;
        stateT += dt;

        if (state === "run") {
          player.y = 300 - clamp(stateT / 1.05, 0, 1) * (300 - forkY);
          if (stateT >= 1.05) {
            player.y = forkY;
            state = "fork";
            forkT = 0;
            api.audio.intro();
          }
        } else if (state === "fork") {
          forkT += dt;
          if (queued !== null) {
            enterBranch(queued);
            queued = null;
          } else if (forkT > 1.8) {
            state = "straight";
            stateT = 0;
          }
        } else if (state === "branch") {
          const p = clamp(stateT / 0.6, 0, 1);
          player.x = 120 + (dir < 0 ? 52 - 120 : 188 - 120) * p;
          player.y = forkY;
          if (p >= 1) {
            state = "climb";
            stateT = 0;
          }
        } else if (state === "climb") {
          const p = clamp(stateT / 0.5, 0, 1);
          player.y = forkY - (forkY - branchY) * p;
          if (p >= 1) {
            hitSpikes();
          }
        } else if (state === "straight") {
          const p = clamp(stateT / 0.45, 0, 1);
          player.y = forkY - 20 * p;
          if (p >= 1) hitSpikes();
        } else if (state === "hit") {
          hitT += dt;
          if (hitT > 0.8 && !reported) {
            reported = true;
            api.lose(
              dir !== 0
                ? "Тупик. Оба выхода на карте вели в стену."
                : "Не выбрал направление. Лабиринт выбрал за тебя."
            );
          }
        }
      },

      press(action) {
        if (action.type !== "left" && action.type !== "right") return;
        if (state === "hit" || state === "branch" || state === "climb" || state === "straight") return;

        if (state === "fork") {
          enterBranch(action.type === "left" ? -1 : 1);
        } else if (state === "run") {
          queued = action.type === "left" ? -1 : 1;
          api.audio.ui();
        }
      },

      draw(ctx) {
        fill(ctx, 0, 0, 240, 320, "#132427");

        for (let y = 0; y < 320; y += 16) {
          for (let x = (y / 16) % 2 ? -12 : 0; x < 240; x += 24) {
            fill(ctx, x + 1, y + 1, 22, 14, "#1a3033");
            fill(ctx, x + 1, y + 1, 22, 1, "rgba(255,255,255,0.045)");
          }
        }

        const floors = [
          [106, 156, 28, 164],
          [36, 148, 168, 28],
          [36, 96, 28, 52],
          [176, 96, 28, 52],
        ];

        for (const [x, y, w, h] of floors) {
          fill(ctx, x, y, w, h, "#315456");
          fill(ctx, x, y, w, 2, "#3d6668");
          fill(ctx, x, y + h - 2, w, 2, "#223d3f");
          fill(ctx, x, y, 2, h, "#3d6668");
          fill(ctx, x + w - 2, y, 2, h, "#223d3f");
        }

        for (let y = 160; y < 320; y += 18) {
          fill(ctx, 108, y, 24, 1, "rgba(255,255,255,0.035)");
        }
        for (let x = 40; x < 204; x += 18) {
          fill(ctx, x, 152, 1, 20, "rgba(255,255,255,0.035)");
        }

        fill(ctx, 102, 80, 4, 68, "#3d6668");
        fill(ctx, 134, 80, 4, 68, "#3d6668");
        fill(ctx, 210, 128, 5, 18, "#3d6668");
        fill(ctx, 25, 128, 5, 18, "#3d6668");

        const spikeGlow = 0.35 + Math.sin(t * 6) * 0.12;
        for (const bx of [36, 176]) {
          const gradient = ctx.createLinearGradient(0, 96, 0, 114);
          gradient.addColorStop(0, "rgba(255,85,119,0.03)");
          gradient.addColorStop(1, `rgba(255,85,119,${spikeGlow})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(bx, 96, 28, 18);

          for (let i = 0; i < 4; i += 1) {
            const sx = bx + 2 + i * 6;
            ctx.fillStyle = i % 2 ? "#c9c2b6" : "#a6a096";
            ctx.beginPath();
            ctx.moveTo(sx, 114);
            ctx.lineTo(sx + 3, 102);
            ctx.lineTo(sx + 6, 114);
            ctx.closePath();
            ctx.fill();
          }
        }

        textCenter(ctx, "ВЫХОД", 50, 86, { size: 9, color: "#ffd447" });
        textCenter(ctx, "ВЫХОД", 190, 86, { size: 9, color: "#ffd447" });

        drawTorch(ctx, 98, 143, t);
        drawTorch(ctx, 142, 143, t + 0.8);

        renderTrail(ctx, player, state);

        if (state === "run" || state === "fork") {
          ctx.save();
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = C.amber;
          ctx.beginPath();
          if (state === "run") {
            ctx.moveTo(player.x - 10, player.y - 4);
            ctx.lineTo(player.x + 10, player.y - 4);
            ctx.lineTo(player.x + 34, 150);
            ctx.lineTo(player.x - 34, 150);
          } else {
            ctx.moveTo(player.x - 10, player.y - 4);
            ctx.lineTo(player.x + 10, player.y - 4);
            ctx.lineTo(player.x + 26, player.y - 30);
            ctx.lineTo(player.x - 26, player.y - 30);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        drawPlayer(ctx, player, state, hitT, dir);

        if (state === "fork") {
          const blink = Math.sin(t * 9) > 0;
          if (blink) {
            text(ctx, "◀", 74, 157, { size: 22, color: C.amber });
            text(ctx, "▶", 152, 157, { size: 22, color: C.amber });
          }
          textCenter(ctx, "ВЫБЕРИ НАПРАВЛЕНИЕ", 120, 196, {
            size: 10,
            color: C.paper,
            shadowColor: "#0b181a",
          });
        }

        if (state === "hit") {
          textCenter(ctx, "ТУПИК!", 120, 206, {
            size: 22,
            color: C.pink,
            shadowColor: "#0b181a",
          });
        }

        if (state === "straight") {
          textCenter(ctx, "СТЕНА!", 120, 206, { size: 20, color: C.pink });
        }

        textCenter(ctx, "◀  ИЛИ  ▶", 120, 300, { size: 10, color: "rgba(255,246,229,0.55)" });
      },
    };
  },
};

function drawTorch(ctx, x, y, t) {
  fill(ctx, x - 2, y, 4, 7, "#4d3120");
  const flicker = Math.sin(t * 13 + x) * 1.5;
  fill(ctx, x - 3 + flicker, y - 7, 6, 7, "#f39433");
  fill(ctx, x - 1 + flicker, y - 10, 4, 5, "#ffd447");
  fill(ctx, x + flicker, y - 11, 2, 3, "#fff6e5");
}

function renderTrail(ctx, player, state) {
  if (state === "run" || state === "fork") {
    for (let i = 0; i < 5; i += 1) {
      const y = player.y + 10 + i * 9;
      fill(ctx, player.x - 1, y, 2, 3, `rgba(255,213,71,${0.24 - i * 0.04})`);
    }
  }
}

function drawPlayer(ctx, player, state, hitT, dir) {
  const bob = state === "run" ? Math.sin(performance.now() / 90) * 1 : 0;
  const x = player.x;
  const y = player.y + bob;

  ctx.save();
  if (state === "hit") {
    const shake = Math.sin(hitT * 50) * 2;
    ctx.translate(shake, 0);
  }

  fill(ctx, x - 6, y - 6, 12, 12, "#161222");
  fill(ctx, x - 5, y - 5, 10, 10, "#ffd447");
  fill(ctx, x - 4, y - 4, 8, 3, "#fff0a8");
  fill(ctx, x - 3, y - 1, 2, 2, "#161222");
  fill(ctx, x + 1, y - 1, 2, 2, "#161222");

  if (state === "hit") {
    fill(ctx, x - 4, y - 1, 2, 2, "#e8473f");
    fill(ctx, x + 2, y - 1, 2, 2, "#e8473f");
  }

  fill(ctx, x - 3, y + 5, 2, 3, "#a35f1f");
  fill(ctx, x + 1, y + 5, 2, 3, "#a35f1f");

  if (state === "branch" || state === "climb") {
    fill(ctx, x + dir * 7, y - 2, 3, 4, "#ffd447");
  }
  ctx.restore();
}
