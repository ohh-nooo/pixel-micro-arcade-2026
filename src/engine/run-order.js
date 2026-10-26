export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickRun(games, seenIds, { size = 3, newGames = 2, random = Math.random } = {}) {
  const seen = seenIds instanceof Set ? seenIds : new Set(seenIds);
  const unseen = shuffle(
    games.filter((game) => !seen.has(game.id)),
    random
  );
  const known = shuffle(
    games.filter((game) => seen.has(game.id)),
    random
  );

  const newTarget = Math.min(newGames, unseen.length, size);
  const picked = unseen.slice(0, newTarget);
  const used = new Set(picked.map((game) => game.id));
  const fill = [...known, ...unseen.filter((game) => !used.has(game.id))];

  for (const game of fill) {
    if (picked.length >= size) break;
    picked.push(game);
  }

  return shuffle(picked, random);
}
