import { CONFIG } from "../config.js";
import { drawAttract, drawFinale, drawIntro, drawPlayOverlay, drawResult } from "./screens.js";
import { AudioBus } from "./audio.js";
import { getGames, validateGames } from "../games/index.js";
import { initAssets } from "./assets.js";
import { Input } from "./input.js";
import { H, W } from "./gfx.js";
import { clamp, pick, rand, randInt } from "./utils.js";

export class Director {
  constructor({ canvas, dom }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.dom = dom;

    this.state = "attract";
    this.t = 0;
    this.lastTime = performance.now();
    this.games = [];
    this.index = 0;
    this.gameDef = null;
    this.instance = null;
    this.reason = "";
    this.playElapsed = 0;
    this.timeLeft = 0;
    this.shake = 0;
    this.nextTick = 0;
    this.lastWholeSecond = 0;

    this.audio = new AudioBus();
    this.input = new Input({
      canvas,
      pads: dom.pads,
      tapHint: dom.tapHint,
      onAction: (action) => this.handleAction(action),
      onToggleSound: () => this.toggleSound(),
    });

    this.loop = this.loop.bind(this);
    this.updateSoundUi();
  }

  async init() {
    await initAssets();
    this.games = getGames();
    validateGames(this.games);
    this.ctx.imageSmoothingEnabled = false;
    this.setDomMode("menu");
    this.setLegend("ТАП / ПРОБЕЛ — НАЧАТЬ СМЕНУ");
    this.setTapHint("ТАПНИ ЭКРАН");
    requestAnimationFrame(this.loop);
  }

  loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - this.lastTime) / 1000));
    this.lastTime = now;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    this.t += dt;
    this.shake = Math.max(0, this.shake - dt * 26);

    switch (this.state) {
      case "intro":
        if (this.t >= CONFIG.introTime) this.enterPlay();
        break;

      case "play": {
        this.playElapsed += dt;
        this.timeLeft -= dt;

        const whole = Math.ceil(this.timeLeft);
        if (whole < this.lastWholeSecond) {
          this.lastWholeSecond = whole;
          if (whole <= 3 && whole > 0) this.audio.tick();
        }

        this.instance?.update?.(dt);

        if (this.state === "play" && this.timeLeft <= 0) {
          this.lose("Время вышло. Победа не предусмотрена.");
        }
        break;
      }

      case "result":
        if (this.t >= CONFIG.resultTime) this.nextGame();
        break;

      default:
        break;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;

    if (this.state === "attract") {
      drawAttract(ctx, this.t);
      return;
    }

    if (this.state === "intro") {
      drawIntro(ctx, this.t, {
        game: this.gameDef,
        index: this.index,
        count: this.games.length,
        duration: CONFIG.introTime,
      });
      return;
    }

    if (this.state === "play") {
      ctx.save();
      this.applyShake(ctx);
      this.drawGame(ctx);
      ctx.restore();

      drawPlayOverlay(ctx, {
        time: clamp(this.timeLeft, 0, this.gameDef?.duration ?? 1),
        duration: this.gameDef?.duration ?? 1,
        goTime: this.playElapsed,
      });
      return;
    }

    if (this.state === "result") {
      ctx.save();
      this.applyShake(ctx);
      this.drawGame(ctx);
      ctx.restore();

      if (this.t < 0.06) {
        ctx.fillStyle = "rgba(255,246,229,0.7)";
        ctx.fillRect(0, 0, W, H);
      }

      drawResult(ctx, this.t, {
        game: this.gameDef,
        reason: this.reason,
        duration: CONFIG.resultTime,
      });
      return;
    }

    if (this.state === "finale") {
      drawFinale(ctx, this.t);
    }
  }

  drawGame(ctx) {
    if (!this.instance) {
      ctx.fillStyle = "#161222";
      ctx.fillRect(0, 0, W, H);
      return;
    }

    try {
      this.instance.draw(ctx);
    } catch (error) {
      console.error(`[game:${this.gameDef?.id}] draw failed`, error);
      ctx.fillStyle = "#3a1020";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff6e5";
      ctx.font = '700 10px "Pixelify Sans", monospace';
      ctx.fillText("ОШИБКА В МИКРОИГРЕ", 34, 150);
    }
  }

  applyShake(ctx) {
    if (this.shake <= 0.1) return;
    const amount = Math.ceil(this.shake);
    ctx.translate(randInt(-amount, amount), randInt(-amount, amount));
  }

  handleAction(action) {
    this.audio.unlock();

    if (this.state === "attract") {
      if (this.t > CONFIG.attractInputDelay) this.startRun();
      return;
    }

    if (this.state === "intro") {
      return;
    }

    if (this.state === "play") {
      if (!this.instance) return;

      if (this.gameDef.input === "tap") {
        if (action.type === "tap") {
          this.instance.press?.({ ...action, x: action.x ?? W / 2, y: action.y ?? H / 2 });
        }
      } else if (this.gameDef.input === "sides") {
        if (action.type === "left" || action.type === "right") {
          this.instance.press?.(action);
        }
      }
      return;
    }

    if (this.state === "result") {
      if (this.t > 0.55) {
        this.audio.ui();
        this.nextGame();
      }
      return;
    }

    if (this.state === "finale") {
      if (this.t > CONFIG.finaleInputDelay) {
        this.startRun();
      }
    }
  }

  startRun() {
    this.audio.unlock();
    this.audio.jingleStart();
    this.index = 0;
    this.enterIntro();
  }

  enterIntro() {
    this.state = "intro";
    this.t = 0;
    this.instance = null;
    this.gameDef = this.games[this.index];

    if (!this.gameDef) {
      this.enterFinale();
      return;
    }

    const number = `${String(this.index + 1).padStart(2, "0")}/${String(this.games.length).padStart(2, "0")}`;
    this.setDomMode("intro");
    this.setTapHint("ПРИГОТОВЬСЯ");
    this.setLegend(`${number} · ${this.gameDef.title} — ${this.gameDef.hint}`);
    this.audio.intro();
  }

  enterPlay() {
    this.state = "play";
    this.t = 0;
    this.playElapsed = 0;
    this.timeLeft = this.gameDef.duration;
    this.lastWholeSecond = Math.ceil(this.timeLeft);
    this.shake = 0;

    const api = {
      w: W,
      h: H,
      width: W,
      height: H,
      index: this.index,
      count: this.games.length,
      lose: (message) => this.lose(message),
      audio: this.audio,
      rand,
      randInt,
      pick,
      clamp,
    };

    try {
      this.instance = this.gameDef.create(api);
    } catch (error) {
      console.error(`[game:${this.gameDef.id}] create failed`, error);
      this.instance = null;
      this.lose("Микрогира сломалась. Победа всё равно не засчитана.");
      return;
    }

    this.setDomMode(this.gameDef.input);
    this.setTapHint("ТАПНИ ГДЕ УГОДНО");
    this.setLegend(
      this.gameDef.input === "sides"
        ? "СЕЙЧАС: ◀ ВЛЕВО / ▶ ВПРАВО (ИЛИ ПОЛОВИНА ЭКРАНА)"
        : "СЕЙЧАС: ТАП ГДЕ УГОДНО"
    );
    this.audio.go();
  }

  lose(reason) {
    if (this.state !== "play") return;

    this.state = "result";
    this.t = 0;
    this.reason = reason || "Так было запланировано с самого начала.";
    this.shake = 5;
    this.audio.lose();

    this.setDomMode("result");
    this.setTapHint("ДАЛЬШЕ");
    this.setLegend(`ПРОИГРЫШ · ${this.gameDef?.title ?? ""}`);
  }

  nextGame() {
    this.index += 1;
    if (this.index >= this.games.length) {
      this.enterFinale();
      return;
    }
    this.audio.ui();
    this.enterIntro();
  }

  enterFinale() {
    this.state = "finale";
    this.t = 0;
    this.instance = null;
    this.audio.jingleEnd();
    this.setDomMode("finale");
    this.setTapHint("ЕЩЁ РАЗ");
    this.setLegend("СМЕНА ОКОНЧЕНА · 10 ИГР · 0 ПОБЕД");
  }

  setDomMode(mode) {
    this.dom.device.dataset.mode = mode;
    this.input.setMode(mode);
  }

  setTapHint(text) {
    this.dom.tapHintText.textContent = text;
  }

  setLegend(text) {
    this.dom.legendMode.textContent = text;
  }

  updateSoundUi() {
    const muted = this.audio.muted;
    this.dom.soundBtn.classList.toggle("is-muted", muted);
    this.dom.soundBtn.setAttribute("aria-pressed", String(muted));
    this.dom.soundBtn.title = muted ? "Звук выключен (M)" : "Звук включён (M)";
    this.dom.soundLabel.textContent = muted ? "OFF" : "SFX";
  }

  toggleSound() {
    this.audio.unlock();
    this.audio.toggle();
    this.updateSoundUi();
    if (!this.audio.muted) this.audio.select();
  }
}
