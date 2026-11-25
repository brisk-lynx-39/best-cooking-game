// Sizzle Shift — game logic: ingredients, recipes, orders, the grill, the plate, scoring.
// Pure state and rules; rendering lives in render.js, sound triggers are returned as events.

export const INGREDIENTS = {
  bun:     { name: 'Bun',     key: '1', color: '#e8b96a', dark: '#c08b3e', grill: false },
  patty:   { name: 'Patty',   key: '2', color: '#8a4b2a', dark: '#5f3018', grill: true, cook: 4.2, burn: 8.6 },
  bacon:   { name: 'Bacon',   key: '3', color: '#c4504e', dark: '#8e3230', grill: true, cook: 3.0, burn: 6.8 },
  cheese:  { name: 'Cheese',  key: '4', color: '#f6c945', dark: '#d9a41f', grill: false },
  egg:     { name: 'Egg',     key: '5', color: '#fdf3d8', dark: '#e8b93e', grill: false },
  tomato:  { name: 'Tomato',  key: '6', color: '#e2543e', dark: '#b23322', grill: false },
  lettuce: { name: 'Lettuce', key: '7', color: '#79c25f', dark: '#4f9440', grill: false },
};
export const ING_ORDER = ['bun', 'patty', 'bacon', 'cheese', 'egg', 'tomato', 'lettuce'];

// Original house specials. `items` is a multiset: order on the plate does not matter.
export const RECIPES = [
  { name: 'Sunrise Stack',   items: ['bun', 'patty', 'cheese', 'egg'],            price: 14 },
  { name: 'Orchard Melt',    items: ['bun', 'patty', 'cheese', 'tomato'],         price: 13 },
  { name: 'Meadow Bowl',     items: ['lettuce', 'tomato', 'egg', 'cheese'],       price: 12 },
  { name: 'Double Ember',    items: ['bun', 'patty', 'patty', 'bacon'],           price: 16 },
  { name: 'Green Ember',     items: ['bun', 'patty', 'lettuce', 'tomato'],        price: 13 },
  { name: 'Rancher Skillet', items: ['patty', 'bacon', 'egg', 'cheese'],          price: 15 },
  { name: 'First Light',     items: ['bun', 'egg', 'bacon', 'cheese'],            price: 13 },
  { name: 'Ember Garden',    items: ['bun', 'patty', 'bacon', 'lettuce'],         price: 14 },
];

export const DAY_SECONDS = 150;
export const STAR_TARGETS = [110, 210, 310];
export const MAX_STRIKES = 3;
const PLATE_MAX = 6;
const GRILL_SLOTS = 3;

function multisetKey(items) {
  return [...items].sort().join(',');
}

export function createGame(rng) {
  return {
    screen: 'title', // title | play | pause | over
    rng,
    time: 0,               // seconds into the day
    spawnIn: 0.8,          // seconds until the next order arrives
    orders: [],            // {id, recipe, patience, patienceMax, x}
    nextOrderId: 1,
    grill: Array.from({ length: GRILL_SLOTS }, () => null), // {ing, t, state}
    plate: [],             // {ing, perfect}
    coins: 0,
    served: 0,
    lost: 0,
    strikes: 0,
    combo: 0,
    bestCombo: 0,
    perfects: 0,
    floats: [],            // {x, y, text, t, color}
    shake: 0,
    events: [],            // sound/event names for main.js to play
    lastServe: null,       // {recipeName, total, x, y} for the serve flash
    serveFlash: 0,
    message: '',
    messageT: 0,
  };
}

export function startDay(g) {
  const fresh = createGame(g.rng);
  fresh.screen = 'play';
  Object.assign(g, fresh);
  g.events.push('bell');
}

function patienceFor(g) {
  // Customers get less patient as the day wears on.
  const base = 58 - 20 * (g.time / DAY_SECONDS);
  return base * (0.9 + g.rng() * 0.25);
}

function spawnInterval(g) {
  return Math.max(4.2, 7.5 - 3.3 * (g.time / DAY_SECONDS)) * (0.85 + g.rng() * 0.3);
}

function spawnOrder(g) {
  const recipe = RECIPES[Math.floor(g.rng() * RECIPES.length)];
  const p = patienceFor(g);
  g.orders.push({ id: g.nextOrderId++, recipe, patience: p, patienceMax: p });
  g.events.push('bell');
}

export function update(g, dt) {
  if (g.screen !== 'play') return;
  g.time += dt;
  g.shake = Math.max(0, g.shake - dt * 3);
  g.serveFlash = Math.max(0, g.serveFlash - dt * 2);
  g.messageT = Math.max(0, g.messageT - dt);
  for (const f of g.floats) { f.t += dt; f.y -= dt * 42; }
  g.floats = g.floats.filter((f) => f.t < 1.15);

  // Grill timers.
  for (const slot of g.grill) {
    if (!slot) continue;
    const was = slot.state;
    slot.t += dt;
    const def = INGREDIENTS[slot.ing];
    slot.state = slot.t >= def.burn ? 'burnt' : slot.t >= def.cook ? 'perfect' : 'raw';
    if (was === 'raw' && slot.state === 'perfect') g.events.push('ding');
    if (was === 'perfect' && slot.state === 'burnt') g.events.push('burnt');
  }

  // Orders arrive.
  if (g.orders.length < 3) {
    g.spawnIn -= dt;
    if (g.spawnIn <= 0) { spawnOrder(g); g.spawnIn = spawnInterval(g); }
  } else {
    g.spawnIn = Math.min(g.spawnIn, 1.2);
  }

  // Patience drains; a customer who waits too long walks out.
  for (const o of g.orders) o.patience -= dt;
  const gone = g.orders.filter((o) => o.patience <= 0);
  if (gone.length) {
    g.orders = g.orders.filter((o) => o.patience > 0);
    for (const o of gone) {
      g.strikes += 1; g.lost += 1; g.combo = 0;
      g.events.push('leave');
      g.floats.push({ x: 140, y: 210, text: 'walked out!', t: 0, color: '#ff9a8a' });
    }
  }

  if (g.strikes >= MAX_STRIKES || g.time >= DAY_SECONDS) {
    g.screen = 'over';
    g.events.push('star');
  }
}

/** Click an ingredient station: grillables go to a free grill slot, the rest to the plate. */
export function pickIngredient(g, ing) {
  if (g.screen !== 'play') return;
  const def = INGREDIENTS[ing];
  if (def.grill) {
    const slot = g.grill.find((s) => s === null);
    if (!slot && slot !== null) { g.events.push('buzz'); flash(g, 'Grill is full!'); return; }
    const idx = g.grill.indexOf(null);
    if (idx === -1) { g.events.push('buzz'); flash(g, 'Grill is full!'); return; }
    g.grill[idx] = { ing, t: 0, state: 'raw' };
    g.events.push('sizzle');
    return;
  }
  if (g.plate.length >= PLATE_MAX) { g.events.push('buzz'); flash(g, 'Plate is full!'); return; }
  g.plate.push({ ing, perfect: false });
  g.events.push('pop');
}

/** Click a grill slot: a perfectly cooked item goes to the plate, a burnt one to the bin. */
export function takeGrill(g, idx) {
  if (g.screen !== 'play') return;
  const slot = g.grill[idx];
  if (!slot) return;
  if (slot.state === 'raw') { g.shake = Math.max(g.shake, 0.35); g.events.push('buzz'); flash(g, 'Still cooking…'); return; }
  if (slot.state === 'burnt') {
    g.grill[idx] = null;
    g.events.push('trash');
    flash(g, 'Burnt — binned!');
    return;
  }
  if (g.plate.length >= PLATE_MAX) { g.events.push('buzz'); flash(g, 'Plate is full!'); return; }
  g.grill[idx] = null;
  g.plate.push({ ing: slot.ing, perfect: true });
  g.events.push('place');
}

export function trashPlate(g) {
  if (g.screen !== 'play') return;
  if (!g.plate.length) return;
  g.plate = [];
  g.events.push('trash');
  flash(g, 'Plate cleared');
}

function flash(g, text) { g.message = text; g.messageT = 1.4; }

/** Serve: the plate must exactly match one open order (as a multiset). */
export function serve(g) {
  if (g.screen !== 'play') return;
  if (!g.plate.length) { g.events.push('buzz'); return; }
  const key = multisetKey(g.plate.map((p) => p.ing));
  const idx = g.orders.findIndex((o) => multisetKey(o.recipe.items) === key);
  if (idx === -1) {
    g.shake = Math.max(g.shake, 0.5);
    g.events.push('buzz');
    flash(g, 'No order matches this plate!');
    return;
  }
  const order = g.orders[idx];
  g.orders.splice(idx, 1);
  const perfectCount = g.plate.filter((p) => p.perfect).length;
  const tip = Math.round(8 * Math.max(0, order.patience / order.patienceMax));
  const perfectBonus = perfectCount * 2;
  g.combo += 1;
  g.bestCombo = Math.max(g.bestCombo, g.combo);
  const comboBonus = Math.min(10, (g.combo - 1) * 2);
  const total = order.recipe.price + tip + perfectBonus + comboBonus;
  g.coins += total;
  g.served += 1;
  g.perfects += perfectCount;
  g.plate = [];
  g.lastServe = { name: order.recipe.name, total };
  g.serveFlash = 1;
  g.spawnIn = Math.min(g.spawnIn, 1.6);
  g.floats.push({ x: 880, y: 330, text: `+${total} coins`, t: 0, color: '#ffd968' });
  if (perfectCount) g.floats.push({ x: 880, y: 362, text: 'golden grill bonus!', t: 0, color: '#ffb35c' });
  g.events.push('serve', 'coin');
}

export function starsFor(coins) {
  return STAR_TARGETS.filter((t) => coins >= t).length;
}
