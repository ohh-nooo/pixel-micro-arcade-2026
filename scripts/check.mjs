import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const candidates = [
  process.env.CHROME_PATH,
  process.env.CHROME_BIN,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Microsoft", "Edge", "Application", "msedge.exe"),
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];
const exe = candidates.find((candidate) => candidate && fs.existsSync(candidate));
if (!exe) {
  console.error("Chrome/Edge not found. Set CHROME_PATH to a Chromium-based browser.");
  process.exit(1);
}

const out = path.join(os.tmpdir(), "opencode", "mg-shots");
fs.mkdirSync(out, { recursive: true });
const url = process.env.CHECK_URL || "http://127.0.0.1:5173/";

const errors = [];
const browser = await chromium.launch({ executablePath: exe, headless: true });

async function newPage(viewport, options = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ...options });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`http ${response.status()}: ${response.url()}`);
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  return { context, page };
}

async function metrics(page, label) {
  const info = await page.evaluate(() => {
    const device = document.querySelector("#device").getBoundingClientRect();
    const screen = document.querySelector("#screen").getBoundingClientRect();
    const legend = document.querySelector("#legend").getBoundingClientRect();
    const legendVisible = getComputedStyle(document.querySelector("#legend")).display !== "none";
    const controls = getComputedStyle(document.querySelector(".device__controls")).display;
    return {
      viewport: { w: innerWidth, h: innerHeight },
      scroll: { w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight },
      device: { x: Math.round(device.x), y: Math.round(device.y), w: Math.round(device.width), h: Math.round(device.height) },
      screen: { w: Math.round(screen.width), h: Math.round(screen.height) },
      legend: legendVisible ? { w: Math.round(legend.width), x: Math.round(legend.x) } : null,
      controls,
      font: getComputedStyle(document.querySelector("#screen")).fontFamily,
    };
  });
  console.log(label, JSON.stringify(info));
  return info;
}

const desktop = await newPage({ width: 1280, height: 900 });
let page = desktop.page;
const desktopMetrics = await metrics(page, "desktop-metrics");
await page.screenshot({ path: path.join(out, "desktop-attract.png") });

const canvas = page.locator("#screen");
let box = await canvas.boundingBox();
await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } });
await page.waitForTimeout(450);
await page.screenshot({ path: path.join(out, "desktop-intro.png") });
await page.waitForTimeout(1300);
await page.screenshot({ path: path.join(out, "desktop-play.png") });

const ids = await page.evaluate(() => window.__MICROGAMES__.games.map((g) => g.id));
console.log("games:", ids.join(", "));
if (ids.length !== 11) errors.push(`expected 11 games, got ${ids.length}`);
if (ids.includes("maze") || ids.includes("worldmap")) errors.push("removed games are still present");

const selection = await page.evaluate(() => {
  const d = window.__MICROGAMES__;
  d.seenGames = new Set();
  const runs = [];

  for (let r = 0; r < 6; r += 1) {
    const before = new Set(d.seenGames);
    d.startRun();
    const runIds = d.run.map((game) => game.id);
    const fresh = runIds.filter((id) => !before.has(id));

    for (let i = 0; i < d.run.length; i += 1) {
      d.index = i;
      d.enterIntro();
    }

    runs.push({ ids: runIds, fresh, before: before.size, after: d.seenGames.size });
  }

  return { runs, seen: [...d.seenGames].sort(), total: d.games.length };
});
console.log("selection:", JSON.stringify(selection));
if (selection.seen.length !== selection.total) errors.push("not all games are marked as seen after six runs");
selection.runs.forEach((run, index) => {
  if (run.ids.length !== 3) errors.push(`run ${index + 1}: expected 3 games`);
  if (new Set(run.ids).size !== run.ids.length) errors.push(`run ${index + 1}: duplicate game`);
  const expectedFresh = index === 0 ? 3 : Math.min(2, selection.total - run.before);
  if (run.fresh.length !== expectedFresh) {
    errors.push(`run ${index + 1}: expected ${expectedFresh} new games, got ${run.fresh.length}`);
  }
});
if (selection.runs[5]?.fresh.length !== 0) errors.push("run after full discovery should use known games");

const actions = {
  race: async () => page.keyboard.press("ArrowLeft"),
  jump: async () => canvas.click({ position: { x: box.width / 2, y: box.height / 2 } }),
  tetris: async () => page.keyboard.press("ArrowLeft"),
  ski: async () => page.keyboard.press("ArrowRight"),
  whack: async () => canvas.click({ position: { x: 240, y: 300 } }),
  catch: async () => page.keyboard.press("ArrowLeft"),
  penalty: async () => canvas.click({ position: { x: 240, y: 320 } }),
  stacker: async () => canvas.click({ position: { x: 240, y: 300 } }),
  fishing: async () => canvas.click({ position: { x: box.width / 2, y: box.height / 2 } }),
  ladder: async () => page.keyboard.press("ArrowLeft"),
  balloon: async () => canvas.click({ position: { x: box.width / 2, y: box.height / 2 } }),
};

const results = {};
for (let i = 0; i < ids.length; i += 1) {
  const id = ids[i];
  await page.evaluate((gameId) => {
    const d = window.__MICROGAMES__;
    const game = d.games.find((item) => item.id === gameId);
    d.run = [game];
    d.lives = 3;
    d.index = 0;
    d.enterIntro();
  }, id);
  await page.waitForTimeout(80);
  await page.evaluate(() => window.__MICROGAMES__.enterPlay());
  await page.waitForTimeout(850);
  const pixels = await page.evaluate(() => {
    const ctx = document.querySelector("#screen").getContext("2d");
    const data = ctx.getImageData(0, 0, 240, 320).data;
    const colors = new Set();
    for (let i = 0; i < data.length; i += 4) {
      colors.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
    }
    return colors.size;
  });
  await page.screenshot({ path: path.join(out, `game-${String(i + 1).padStart(2, "0")}-${id}.png`) });
  await actions[id]();
  const started = Date.now();
  try {
    await page.waitForFunction(() => window.__MICROGAMES__.state === "result", null, { timeout: 6500 });
  } catch {
    errors.push(`${id}: never reached result`);
  }
  const elapsed = Date.now() - started;
  const result = await page.evaluate(() => ({
    state: window.__MICROGAMES__.state,
    reason: window.__MICROGAMES__.reason,
    timeLeft: Math.round(window.__MICROGAMES__.timeLeft * 10) / 10,
  }));
  results[id] = { ...result, colors: pixels, elapsed };
  console.log(id, JSON.stringify(results[id]));
  if (i === 0 || i === 3 || i === ids.length - 1) {
    await page.screenshot({ path: path.join(out, `result-${id}.png`) });
  }
}

await page.evaluate(() => {
  const d = window.__MICROGAMES__;
  d.startRun();
  d.enterPlay();
});
try {
  await page.waitForFunction(() => window.__MICROGAMES__.state === "result", null, { timeout: 7000 });
} catch {
  errors.push("skip-test: never reached result");
}
await page.waitForTimeout(700);
await page.locator("#screen").click({ position: { x: box.width / 2, y: box.height / 2 } });
await page.waitForTimeout(200);
const skip = await page.evaluate(() => ({
  state: window.__MICROGAMES__.state,
  index: window.__MICROGAMES__.index,
  lives: window.__MICROGAMES__.lives,
}));
console.log("result skip ->", JSON.stringify(skip));
if (skip.state !== "intro" || skip.index !== 1 || skip.lives !== 2) {
  errors.push("result skip did not advance to the next intro with one life lost");
}

const lifeTest = await page.evaluate(() => {
  const d = window.__MICROGAMES__;
  d.startRun();
  const steps = [];

  for (let i = 0; i < 3; i += 1) {
    d.enterPlay();
    d.lose("test");
    steps.push({ lives: d.lives, index: d.index, state: d.state });
    d.nextGame();
  }

  return { steps, state: d.state, lives: d.lives };
});
console.log("lives:", JSON.stringify(lifeTest));
if (lifeTest.steps.map((step) => step.lives).join(",") !== "2,1,0") {
  errors.push("lives did not count down 3 -> 2 -> 1 -> 0");
}
if (lifeTest.state !== "finale" || lifeTest.lives !== 0) {
  errors.push("run did not end after three lost lives");
}

await page.evaluate(() => window.__MICROGAMES__.enterFinale());
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(out, "desktop-finale.png") });

await desktop.context.close();

const shortDesktop = await newPage({ width: 1366, height: 768 });
const shortMetrics = await metrics(shortDesktop.page, "short-desktop-metrics");
await shortDesktop.page.screenshot({ path: path.join(out, "desktop-1366x768.png") });
await shortDesktop.context.close();

const mobile = await newPage({ width: 390, height: 844 }, { hasTouch: true, isMobile: true });
page = mobile.page;
const mobileMetrics = await metrics(page, "mobile-metrics");
await page.screenshot({ path: path.join(out, "mobile-attract.png") });
await page.evaluate(() => {
  const d = window.__MICROGAMES__;
  const game = d.games.find((item) => item.input === "sides");
  d.run = [game];
  d.lives = 3;
  d.index = 0;
  d.enterIntro();
});
await page.waitForTimeout(80);
await page.evaluate(() => window.__MICROGAMES__.enterPlay());
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(out, "mobile-play.png") });
const padVisible = await page.evaluate(() => getComputedStyle(document.querySelector(".device__controls")).display !== "none");
console.log("mobile mode/pad visible:", await page.evaluate(() => document.querySelector("#device").dataset.mode), padVisible);
if (!padVisible) errors.push("mobile pads are not visible during play");
const mobilePlayMetrics = await metrics(page, "mobile-play-metrics");
await mobile.context.close();

const mobileTap = await newPage({ width: 390, height: 844 }, { hasTouch: true, isMobile: true });
page = mobileTap.page;
await page.evaluate(() => {
  const d = window.__MICROGAMES__;
  const game = d.games.find((item) => item.id === "penalty");
  d.run = [game];
  d.lives = 3;
  d.index = 0;
  d.enterIntro();
});
await page.waitForTimeout(80);
await page.evaluate(() => window.__MICROGAMES__.enterPlay());
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, "mobile-tap-play.png") });
const tapBox = await page.locator("#screen").boundingBox();
await page.touchscreen.tap(tapBox.x + tapBox.width * 0.7, tapBox.y + tapBox.height * 0.4);
try {
  await page.waitForFunction(() => window.__MICROGAMES__.state === "result", null, { timeout: 3500 });
} catch {
  errors.push("mobile tap: never reached result");
}
await page.screenshot({ path: path.join(out, "mobile-tap-result.png") });
const tapResult = await page.evaluate(() => ({
  state: window.__MICROGAMES__.state,
  reason: window.__MICROGAMES__.reason,
}));
console.log("mobile tap:", JSON.stringify(tapResult));
if (tapResult.state !== "result") errors.push("mobile tap did not end the game");

await page.evaluate(() => window.__MICROGAMES__.enterFinale());
await page.waitForTimeout(1000);
const finaleBox = await page.locator("#screen").boundingBox();
await page.touchscreen.tap(finaleBox.x + finaleBox.width / 2, finaleBox.y + finaleBox.height / 2);
await page.waitForTimeout(250);
const restart = await page.evaluate(() => ({
  state: window.__MICROGAMES__.state,
  index: window.__MICROGAMES__.index,
  lives: window.__MICROGAMES__.lives,
}));
console.log("finale restart:", JSON.stringify(restart));
if (restart.state !== "intro" || restart.index !== 0 || restart.lives !== 3) {
  errors.push("finale tap did not restart the run with three lives");
}
await mobileTap.context.close();

const allResults = Object.values(results);
const allLost = allResults.every((r) => r.state === "result" && r.reason.length > 0 && r.colors > 50);
console.log("all games lost:", allLost);
const desktopFits = desktopMetrics.scroll.h <= desktopMetrics.viewport.h && desktopMetrics.scroll.w <= desktopMetrics.viewport.w;
const shortFits = shortMetrics.scroll.h <= shortMetrics.viewport.h && shortMetrics.scroll.w <= shortMetrics.viewport.w;
const mobileFits = [mobileMetrics, mobilePlayMetrics].every(
  (m) => m.scroll.w <= m.viewport.w && m.scroll.h <= m.viewport.h,
);
console.log("desktop fits:", desktopFits, "short fits:", shortFits, "mobile fits:", mobileFits);
if (!allLost) errors.push("not every game reached a loss state");
if (!desktopFits || !shortFits || !mobileFits) errors.push("layout overflows the viewport");

await browser.close();

console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
console.log("shots in", out);
if (errors.length) process.exitCode = 1;
