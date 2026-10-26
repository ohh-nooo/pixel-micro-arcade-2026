import { C, fill, text, textCenter, badge, line } from "../engine/gfx.js";
import { clamp } from "../engine/utils.js";

export default {
  id: "tetris",
  title: "ТЕТРИС",
  hint: "Собери линию. Фигура уже выбрана за тебя.",
  input: "sides",
  duration: 6,

  create(api) {
    const cols = 10;
    const rows = 16;
    const cell = 13;
    const boardX = 55;
    const boardY = 80;
    const boardW = cols * cell;
    const boardH = rows * cell;

    const colors = ["#4fc45c", "#3b7ed6", "#ffd447", "#a463e8", "#f39433", "#59c6b5"];
    const board = Array.from({ length: rows }, () => Array(cols).fill(null));

    for (let y = 8; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (x === 3) continue;
        board[y][x] = colors[(x + y * 2) % colors.length];
      }
    }

    const piece = {
      row: 0,
      col: 3,
      width: 4,
      color: "#a463e8",
    };

    let t = 0;
    let locked = false;
    let lockT = 0;
    let reported = false;
    let falling = true;

    function pieceCells(col = piece.col, row = piece.row) {
      return [
        { x: col, y: row },
        { x: col + 1, y: row },
        { x: col + 2, y: row },
        { x: col + 3, y: row },
      ];
    }

    function drawBlock(ctx, gx, gy, color, size = cell, alpha = 1) {
      const x = boardX + gx * cell;
      const y = boardY + gy * cell;
      ctx.save();
      ctx.globalAlpha *= alpha;
      fill(ctx, x, y, size, size, "#100c1c");
      fill(ctx, x + 1, y + 1, size - 2, size - 2, color);
      fill(ctx, x + 2, y + 2, size - 4, 2, "rgba(255,255,255,0.34)");
      fill(ctx, x + 2, y + size - 4, size - 4, 2, "rgba(0,0,0,0.22)");
      ctx.restore();
    }

    return {
      update(dt) {
        t += dt;

        if (locked) {
          lockT += dt;
          if (lockT > 1.05 && !reported) {
            reported = true;
            api.lose("Фигура не та. Ряд не собран. Тетрис победил.");
          }
          return;
        }

        if (!falling) return;

        piece.row += dt * 4.1;

        if (piece.row >= 7) {
          piece.row = 7;
          falling = false;
          locked = true;
          lockT = 0;
          for (const c of pieceCells()) {
            if (c.y < rows && c.x >= 0 && c.x < cols) board[c.y][c.x] = piece.color;
          }
          api.audio.thud();
        }
      },

      press(action) {
        if (locked || !falling) return;
        if (action.type === "left") {
          piece.col = clamp(piece.col - 1, 0, cols - piece.width);
          api.audio.ui();
        } else if (action.type === "right") {
          piece.col = clamp(piece.col + 1, 0, cols - piece.width);
          api.audio.ui();
        }
      },

      draw(ctx) {
        fill(ctx, 0, 0, 240, 320, "#171128");
        fill(ctx, 0, 0, 240, 6, "#0d0a17");

        for (let i = 0; i < 10; i += 1) {
          fill(ctx, i * 28, 9, 1, 7, "rgba(255,255,255,0.06)");
        }

        text(ctx, "0 ЛИНИЙ", 14, 21, { size: 9, color: "#b4a7d4" });
        text(ctx, "СЛЕД", 14, 38, { size: 9, color: "#b4a7d4" });
        for (let i = 0; i < 4; i += 1) {
          const x = 14 + i * 8;
          fill(ctx, x, 52, 7, 7, "#100c1c");
          fill(ctx, x + 1, 53, 5, 5, "#f39433");
        }

        text(ctx, "0", 226, 20, { size: 16, color: C.amber, align: "right" });
        text(ctx, "ОЧКОВ", 226, 38, { size: 9, color: "#b4a7d4", align: "right" });

        fill(ctx, boardX - 4, boardY - 4, boardW + 8, boardH + 8, "#0d0a17");
        fill(ctx, boardX - 2, boardY - 2, boardW + 4, boardH + 4, "#51446f");
        fill(ctx, boardX, boardY, boardW, boardH, "#141022");

        for (let y = 0; y < rows; y += 1) {
          for (let x = 0; x < cols; x += 1) {
            if (board[y][x]) drawBlock(ctx, x, y, board[y][x]);
          }
        }

        fill(ctx, boardX, boardY, boardW, boardH, "rgba(0,0,0,0)");

        for (let x = 1; x < cols; x += 1) {
          fill(ctx, boardX + x * cell, boardY, 1, boardH, "rgba(255,255,255,0.035)");
        }
        for (let y = 1; y < rows; y += 1) {
          fill(ctx, boardX, boardY + y * cell, boardW, 1, "rgba(255,255,255,0.035)");
        }

        const wellX = boardX + 3 * cell;
        const wellY = boardY + 8 * cell;
        const wellGlow = 0.18 + Math.sin(t * 5) * 0.08;
        fill(ctx, wellX + 1, wellY + 1, cell - 2, cell - 2, `rgba(255,85,119,${wellGlow})`);

        if (!locked) {
          const ghostY = boardY + 7 * cell;
          for (const c of pieceCells()) {
            fill(ctx, boardX + c.x * cell + 1, ghostY + 1, cell - 2, 1, "rgba(164,99,232,0.55)");
            fill(ctx, boardX + c.x * cell + 1, ghostY + cell - 2, cell - 2, 1, "rgba(164,99,232,0.55)");
            fill(ctx, boardX + c.x * cell + 1, ghostY + 1, 1, cell - 2, "rgba(164,99,232,0.55)");
            fill(ctx, boardX + c.x * cell + cell - 2, ghostY + 1, 1, cell - 2, "rgba(164,99,232,0.55)");
          }

          for (const c of pieceCells()) {
            drawBlock(ctx, c.x, c.y, piece.color);
          }
        } else {
          const flash = Math.sin(lockT * 24) > 0 ? 1 : 0.35;
          ctx.save();
          ctx.globalAlpha = flash;
          fill(ctx, boardX + piece.col * cell, boardY + 7 * cell, cell * 4, cell, "rgba(255,85,119,0.35)");
          ctx.restore();

          ctx.save();
          ctx.translate(120, 190);
          ctx.rotate(-0.06);
          textCenter(ctx, "НЕ ТА", 0, -18, { size: 27, color: C.pink, shadowColor: "#100c1f" });
          textCenter(ctx, "ФИГУРА", 0, 8, { size: 18, color: C.paper, shadowColor: "#100c1f" });
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = 0.65 + Math.sin(t * 6) * 0.2;
        badge(ctx, "◀  ▶", 120, 294, { size: 11, bg: "#392e58", color: "#e1d8ff", align: "center" });
        ctx.restore();

        line(ctx, 10, 315, 230, 315, "rgba(255,255,255,0.09)");
      },
    };
  },
};
