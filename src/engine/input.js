import { W } from "./gfx.js";

export class Input {
  constructor({ canvas, pads, tapHint, onAction, onToggleSound }) {
    this.canvas = canvas;
    this.pads = pads;
    this.tapHint = tapHint;
    this.onAction = onAction;
    this.onToggleSound = onToggleSound;
    this.mode = "menu";

    this.bindPointer();
    this.bindKeyboard();
    this.bindPads();
    this.bindTapHint();
  }

  setMode(mode) {
    this.mode = mode;
    this.canvas.style.cursor = mode === "sides" ? "pointer" : "default";
  }

  emit(action) {
    this.onAction?.(action);
  }

  dispatchPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * this.canvas.width;
    const y = ((clientY - rect.top) / rect.height) * this.canvas.height;

    if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) return;

    if (this.mode === "sides") {
      this.emit({ type: x < W / 2 ? "left" : "right", x, y, source: "screen" });
    } else {
      this.emit({ type: "tap", x, y, source: "screen" });
    }
  }

  bindPointer() {
    this.canvas.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        event.preventDefault();
        this.canvas.setPointerCapture?.(event.pointerId);
        this.dispatchPoint(event.clientX, event.clientY);
      },
      { passive: false }
    );

    this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  bindPads() {
    for (const pad of this.pads) {
      const dir = pad.dataset.dir;
      pad.addEventListener(
        "pointerdown",
        (event) => {
          event.preventDefault();
          this.flash(pad);
          this.emit({ type: dir, source: "pad" });
        },
        { passive: false }
      );
    }
  }

  bindTapHint() {
    this.tapHint?.addEventListener(
      "pointerdown",
      (event) => {
        event.preventDefault();
        this.emit({ type: "tap", x: W / 2, y: 170, source: "hint" });
      },
      { passive: false }
    );
  }

  flash(pad) {
    pad.classList.add("is-pressed");
    window.setTimeout(() => pad.classList.remove("is-pressed"), 90);
  }

  flashDir(dir) {
    const pad = this.pads.find((item) => item.dataset.dir === dir);
    if (pad) this.flash(pad);
  }

  bindKeyboard() {
    window.addEventListener(
      "keydown",
      (event) => {
        if (event.code === "KeyM") {
          event.preventDefault();
          this.onToggleSound?.();
          return;
        }

        if (event.repeat) return;

        if (event.code === "ArrowLeft" || event.code === "KeyA") {
          event.preventDefault();
          this.flashDir("left");
          this.emit({ type: "left", source: "keyboard" });
          return;
        }

        if (event.code === "ArrowRight" || event.code === "KeyD") {
          event.preventDefault();
          this.flashDir("right");
          this.emit({ type: "right", source: "keyboard" });
          return;
        }

        if (event.code === "Space" || event.code === "Enter" || event.code === "KeyZ" || event.code === "KeyX") {
          event.preventDefault();
          this.emit({ type: "tap", x: W / 2, y: 170, source: "keyboard" });
        }
      },
      { passive: false }
    );
  }
}
