// Sizzle Shift — boot, the frame loop, and mouse/keyboard input.

import { createGame, startDay, update, pickIngredient, takeGrill, trashPlate, serve, ING_ORDER, INGREDIENTS } from './game.js';
import { draw, LAYOUT } from './render.js';
import { sfx } from './audio.js';
import { shotScene } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || (Date.now() % 100000));
const g = createGame(mulberry32(seed));

const shot = params.get('shot');
if (shot) {
  shotScene(g, shot);
  draw(ctx, g);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(g, dt);
    for (const e of g.events) if (sfx[e]) sfx[e]();
    g.events.length = 0;
    draw(ctx, g);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function canvasPos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function inRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

canvas.addEventListener('pointerdown', (evt) => {
  sfx.unlock();
  const { x, y } = canvasPos(evt);
  if (g.screen === 'title' || g.screen === 'over') { startDay(g); return; }
  if (g.screen === 'pause') { g.screen = 'play'; return; }
  // Stations.
  ING_ORDER.forEach((ing, i) => {
    const sx = LAYOUT.stationX0 + i * (LAYOUT.stationW + LAYOUT.stationGap);
    if (inRect(x, y, { x: sx, y: LAYOUT.stationY, w: LAYOUT.stationW, h: LAYOUT.stationH })) pickIngredient(g, ing);
  });
  // Grill slots.
  for (let i = 0; i < 3; i++) {
    const sx = LAYOUT.grillX + 22 + i * (LAYOUT.slotW + 10);
    const sy = LAYOUT.grillY + 48;
    if (inRect(x, y, { x: sx, y: sy, w: LAYOUT.slotW, h: LAYOUT.slotH })) takeGrill(g, i);
  }
  if (inRect(x, y, LAYOUT.serveBtn)) serve(g);
  if (inRect(x, y, LAYOUT.trashBtn)) trashPlate(g);
  draw(ctx, g);
});

window.addEventListener('keydown', (evt) => {
  if (shot) return;
  sfx.unlock();
  const k = evt.key;
  if (k === 'Enter' && (g.screen === 'title' || g.screen === 'over')) { startDay(g); return; }
  if ((k === 'p' || k === 'P') && (g.screen === 'play' || g.screen === 'pause')) {
    g.screen = g.screen === 'play' ? 'pause' : 'play';
    return;
  }
  if (g.screen !== 'play') return;
  if (k === ' ') { evt.preventDefault(); serve(g); return; }
  if (k === 'Backspace' || k === 'Delete') { evt.preventDefault(); trashPlate(g); return; }
  const lower = k.toLowerCase();
  if (lower === 'q') takeGrill(g, 0);
  else if (lower === 'w') takeGrill(g, 1);
  else if (lower === 'e') takeGrill(g, 2);
  else {
    const ing = ING_ORDER.find((name) => INGREDIENTS[name].key === k);
    if (ing) pickIngredient(g, ing);
  }
});
