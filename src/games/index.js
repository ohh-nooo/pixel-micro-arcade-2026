import { CONFIG } from "../config.js";

const modules = import.meta.glob("./*.js", { eager: true });

const discovered = Object.entries(modules)
  .filter(([path]) => !path.endsWith("/index.js"))
  .map(([, module]) => module.default)
  .filter((game) => game && game.id && typeof game.create === "function");

const byId = new Map(discovered.map((game) => [game.id, game]));

export function getGames() {
  const ordered = CONFIG.gameOrder.map((id) => byId.get(id)).filter(Boolean);
  const rest = discovered
    .filter((game) => !CONFIG.gameOrder.includes(game.id))
    .sort((a, b) => a.title.localeCompare(b.title, "ru"));

  return [...ordered, ...rest];
}

export function validateGames(games) {
  games.forEach((game) => {
    if (!["sides", "tap"].includes(game.input)) {
      console.warn(`[games] "${game.id}" has unknown input mode "${game.input}"`);
    }
  });
}
