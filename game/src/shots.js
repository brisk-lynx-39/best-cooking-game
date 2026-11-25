// Sizzle Shift — deterministic screenshot scenes behind ?shot=title|assembly|serve|end.
// Each scene builds a real game state with the real rules data (recipes, grill states, plate)
// and lets render.js draw it, so a screenshot is exactly what the game itself looks like.

import { RECIPES, DAY_SECONDS } from './game.js';

function order(g, recipeIdx, patienceFrac) {
  const recipe = RECIPES[recipeIdx];
  const p = 50 * patienceFrac;
  return { id: g.nextOrderId++, recipe, patience: p, patienceMax: 50 };
}

export function shotScene(g, shot) {
  if (shot === 'title') {
    g.screen = 'title';
    // A quiet kitchen behind the title card: one order waiting, a patty on the grill.
    g.orders = [order(g, 0, 0.9)];
    g.grill[0] = { ing: 'patty', t: 5.2, state: 'perfect' };
    g.time = 12;
    return;
  }
  if (shot === 'assembly') {
    g.screen = 'play';
    g.time = 47;
    g.coins = 86;
    g.combo = 2;
    g.served = 4;
    g.orders = [order(g, 0, 0.72), order(g, 4, 0.45), order(g, 2, 0.9)];
    // One dish mid-assembly: bun down, a golden patty just plated, cheese next.
    g.plate = [{ ing: 'bun', perfect: false }, { ing: 'patty', perfect: true }];
    g.grill[0] = { ing: 'bacon', t: 3.6, state: 'perfect' };
    g.grill[1] = { ing: 'patty', t: 1.8, state: 'raw' };
    g.floats = [{ x: 880, y: 330, text: '+21 coins', t: 0.3, color: '#ffd968' }];
    return;
  }
  if (shot === 'serve') {
    g.screen = 'play';
    g.time = 96;
    g.coins = 198;
    g.combo = 4;
    g.served = 9;
    g.strikes = 1;
    g.orders = [order(g, 3, 0.6), order(g, 1, 0.85)];
    // The Double Ember is plated exactly as ordered and ready to serve.
    g.plate = [
      { ing: 'bun', perfect: false },
      { ing: 'patty', perfect: true },
      { ing: 'patty', perfect: true },
      { ing: 'bacon', perfect: true },
    ];
    g.grill[2] = { ing: 'patty', t: 9.4, state: 'burnt' };
    g.serveFlash = 0.85;
    return;
  }
  // end
  g.screen = 'over';
  g.time = DAY_SECONDS;
  g.coins = 246;
  g.served = 13;
  g.lost = 1;
  g.bestCombo = 6;
  g.perfects = 11;
  g.orders = [order(g, 5, 0.5)];
  g.plate = [{ ing: 'bun', perfect: false }, { ing: 'egg', perfect: false }];
}
