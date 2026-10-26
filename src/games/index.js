const modules = import.meta.glob("./*.js", { eager: true });

const discovered = Object.entries(modules)
  .filter(([path]) => !path.endsWith("/index.js"))
  .map(([, module]) => module.default)
  .filter((game) => game && game.id && typeof game.create === "function");

export function getGames() {
  return [...discovered].sort((a, b) => a.id.localeCompare(b.id));
}

export function validateGames(games) {
  games.forEach((game) => {
    if (!["sides", "tap"].includes(game.input)) {
      console.warn(`[games] "${game.id}" has unknown input mode "${game.input}"`);
    }
  });
}
