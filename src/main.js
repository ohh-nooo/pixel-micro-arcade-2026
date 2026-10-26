import "@fontsource/pixelify-sans/400.css";
import "@fontsource/pixelify-sans/600.css";
import "@fontsource/pixelify-sans/700.css";
import "./style.css";

import { Director } from "./engine/director.js";

const canvas = document.querySelector("#screen");

const dom = {
  device: document.querySelector("#device"),
  led: document.querySelector("#led"),
  legendMode: document.querySelector("#legend-mode"),
  soundBtn: document.querySelector("#sound-btn"),
  soundLabel: document.querySelector("#sound-label"),
  pads: Array.from(document.querySelectorAll(".pad[data-dir]")),
  tapHint: document.querySelector("#tap-hint"),
  tapHintText: document.querySelector("#tap-hint-text"),
};

dom.soundBtn.addEventListener("click", () => {
  director.toggleSound();
});

const director = new Director({ canvas, dom });
window.__MICROGAMES__ = director;

async function boot() {
  try {
    await document.fonts.ready;
  } catch {
    // Font loading is best-effort; the game still works with fallbacks.
  }

  await director.init();
}

boot();

if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}
