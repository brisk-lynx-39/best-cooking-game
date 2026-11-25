// Sizzle Shift — all canvas drawing. Warm diner palette, everything drawn in code.

import { INGREDIENTS, ING_ORDER, RECIPES, DAY_SECONDS, STAR_TARGETS, MAX_STRIKES, starsFor } from './game.js';

export const W = 1280, H = 800;

// Layout shared with main.js hit-testing.
export const LAYOUT = {
  stationY: 618, stationH: 128, stationW: 158, stationX0: 36, stationGap: 14,
  grillX: 36, grillY: 300, grillW: 400, grillH: 208, slotW: 112, slotH: 118,
  plateCx: 648, plateCy: 408,
  serveBtn: { x: 902, y: 330, w: 168, h: 74 },
  trashBtn: { x: 902, y: 424, w: 168, h: 56 },
  orderX0: 24, orderY: 64, orderW: 296, orderH: 128, orderGap: 14,
};

const FONT = 'Georgia, "Times New Roman", serif';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'left', bold = false) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

/** One ingredient drawn as a little food glyph centred at (cx, cy), radius r. */
export function drawIngredient(ctx, ing, cx, cy, r) {
  const d = INGREDIENTS[ing];
  ctx.save();
  ctx.translate(cx, cy);
  switch (ing) {
    case 'bun':
      ctx.fillStyle = d.color;
      ctx.beginPath(); ctx.ellipse(0, 2, r, r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = d.dark;
      ctx.beginPath(); ctx.ellipse(0, r * 0.34, r, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff3cf';
      for (const [sx, sy] of [[-0.4, -0.1], [0.1, -0.28], [0.45, 0.02]]) {
        ctx.beginPath(); ctx.ellipse(r * sx, r * sy, r * 0.1, r * 0.05, 0.6, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'patty':
      ctx.fillStyle = d.dark;
      ctx.beginPath(); ctx.ellipse(0, 1, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = d.color;
      ctx.beginPath(); ctx.ellipse(0, -1, r * 0.92, r * 0.52, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'bacon':
      ctx.strokeStyle = d.color; ctx.lineWidth = r * 0.52; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, r * 0.3);
      ctx.bezierCurveTo(-r * 0.3, -r * 0.5, r * 0.3, r * 0.55, r * 0.8, -r * 0.25);
      ctx.stroke();
      ctx.strokeStyle = '#f2a49e'; ctx.lineWidth = r * 0.16;
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, r * 0.3);
      ctx.bezierCurveTo(-r * 0.3, -r * 0.5, r * 0.3, r * 0.55, r * 0.8, -r * 0.25);
      ctx.stroke();
      break;
    case 'cheese':
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.55); ctx.lineTo(r, -r * 0.55); ctx.lineTo(r * 0.55, r * 0.7); ctx.lineTo(0, r * 0.3); ctx.lineTo(-r * 0.6, r * 0.75); ctx.closePath(); ctx.fill();
      ctx.fillStyle = d.dark;
      for (const [hx, hy, hr] of [[-0.35, -0.1, 0.16], [0.4, 0.05, 0.12], [0.05, -0.32, 0.1]]) {
        ctx.beginPath(); ctx.arc(r * hx, r * hy, r * hr, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'egg':
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.8);
      ctx.bezierCurveTo(r * 0.9, -r * 0.5, r * 0.75, r * 0.6, 0, r * 0.75);
      ctx.bezierCurveTo(-r * 0.8, r * 0.55, -r * 0.9, -r * 0.45, 0, -r * 0.8);
      ctx.fill();
      ctx.fillStyle = '#f7b733';
      ctx.beginPath(); ctx.arc(0, 0.05 * r, r * 0.42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd968';
      ctx.beginPath(); ctx.arc(-r * 0.12, -r * 0.1, r * 0.16, 0, Math.PI * 2); ctx.fill();
      break;
    case 'tomato':
      ctx.fillStyle = d.color;
      ctx.beginPath(); ctx.arc(0, r * 0.08, r * 0.82, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = d.dark;
      ctx.beginPath(); ctx.arc(0, r * 0.08, r * 0.6, 0, Math.PI * 2); ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = '#fdf0d5'; ctx.lineWidth = r * 0.07;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        ctx.beginPath(); ctx.moveTo(0, r * 0.08); ctx.lineTo(Math.cos(a) * r * 0.55, r * 0.08 + Math.sin(a) * r * 0.55); ctx.stroke();
      }
      break;
    case 'lettuce':
      ctx.fillStyle = d.color;
      for (const [lx, ly, lr] of [[-0.45, 0.1, 0.5], [0.45, 0.1, 0.5], [0, -0.25, 0.55], [0, 0.3, 0.5]]) {
        ctx.beginPath(); ctx.arc(r * lx, r * ly, r * lr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = d.dark; ctx.lineWidth = r * 0.08;
      ctx.beginPath(); ctx.moveTo(-r * 0.6, r * 0.35); ctx.quadraticCurveTo(0, -r * 0.5, r * 0.6, r * 0.3); ctx.stroke();
      break;
  }
  ctx.restore();
}

function drawWall(ctx, g) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#4a2c17');
  grad.addColorStop(0.55, '#5d3a1e');
  grad.addColorStop(1, '#3c2312');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // Tile splashback.
  ctx.fillStyle = 'rgba(240,214,165,0.07)';
  for (let y = 236; y < 560; y += 44) for (let x = 0; x < W; x += 88) ctx.fillRect(x + ((y / 44) % 2) * 44, y, 84, 40);
  // Hanging lamps.
  for (const lx of [220, 640, 1060]) {
    ctx.strokeStyle = '#241407'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 34); ctx.stroke();
    const lg = ctx.createRadialGradient(lx, 58, 4, lx, 58, 60);
    lg.addColorStop(0, 'rgba(255,205,110,0.5)'); lg.addColorStop(1, 'rgba(255,205,110,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(lx, 58, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2c1a0b';
    ctx.beginPath(); ctx.moveTo(lx - 26, 52); ctx.lineTo(lx + 26, 52); ctx.lineTo(lx + 12, 28); ctx.lineTo(lx - 12, 28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd968'; ctx.beginPath(); ctx.arc(lx, 54, 7, 0, Math.PI * 2); ctx.fill();
  }
  // Counter.
  const cg = ctx.createLinearGradient(0, LAYOUT.stationY - 26, 0, H);
  cg.addColorStop(0, '#8a5a2e'); cg.addColorStop(0.12, '#77491f'); cg.addColorStop(1, '#5b3413');
  ctx.fillStyle = cg;
  ctx.fillRect(0, LAYOUT.stationY - 26, W, H - LAYOUT.stationY + 26);
  ctx.fillStyle = 'rgba(255,220,160,0.25)';
  ctx.fillRect(0, LAYOUT.stationY - 26, W, 4);
}

function drawOrderBoard(ctx, g) {
  text(ctx, 'ORDER BOARD', LAYOUT.orderX0 + 2, 34, 21, '#ffd968', 'left', true);
  for (let i = 0; i < 3; i++) {
    const x = LAYOUT.orderX0 + i * (LAYOUT.orderW + LAYOUT.orderGap);
    const y = LAYOUT.orderY;
    const o = g.orders[i];
    ctx.fillStyle = 'rgba(20,10,4,0.45)';
    rr(ctx, x + 4, y + 5, LAYOUT.orderW, LAYOUT.orderH, 12); ctx.fill();
    ctx.fillStyle = o ? '#f7ead0' : 'rgba(247,234,208,0.16)';
    rr(ctx, x, y, LAYOUT.orderW, LAYOUT.orderH, 12); ctx.fill();
    if (!o) {
      text(ctx, 'waiting for', x + LAYOUT.orderW / 2, y + 52, 17, 'rgba(90,60,30,0.55)', 'center');
      text(ctx, 'customers…', x + LAYOUT.orderW / 2, y + 78, 17, 'rgba(90,60,30,0.55)', 'center');
      continue;
    }
    text(ctx, o.recipe.name, x + 16, y + 24, 21, '#5b3413', 'left', true);
    text(ctx, `${o.recipe.price}c`, x + LAYOUT.orderW - 16, y + 24, 19, '#a86e12', 'right', true);
    const items = o.recipe.items;
    items.forEach((ing, j) => {
      drawIngredient(ctx, ing, x + 34 + j * 52, y + 66, 21);
    });
    // Patience bar.
    const frac = Math.max(0, o.patience / o.patienceMax);
    ctx.fillStyle = '#d9c39a'; rr(ctx, x + 14, y + LAYOUT.orderH - 24, LAYOUT.orderW - 28, 11, 5); ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#79c25f' : frac > 0.25 ? '#f6c945' : '#e2543e';
    if (frac > 0.01) { rr(ctx, x + 14, y + LAYOUT.orderH - 24, (LAYOUT.orderW - 28) * frac, 11, 5); ctx.fill(); }
  }
}

function drawHUD(ctx, g) {
  const x = 986, y = 30;
  ctx.fillStyle = 'rgba(20,10,4,0.5)';
  rr(ctx, x - 14, 12, 282, 46, 10); ctx.fill();
  const remain = Math.max(0, DAY_SECONDS - g.time);
  const mm = Math.floor(remain / 60), ss = Math.floor(remain % 60);
  text(ctx, `⏱ ${mm}:${String(ss).padStart(2, '0')}`, x, y + 8, 22, remain < 20 ? '#ff9a8a' : '#ffe9bd', 'left', true);
  text(ctx, `● ${g.coins}`, x + 118, y + 8, 22, '#ffd968', 'left', true);
  // Strikes as little turned-away tickets.
  for (let i = 0; i < MAX_STRIKES; i++) {
    ctx.fillStyle = i < g.strikes ? '#e2543e' : 'rgba(255,233,189,0.3)';
    ctx.beginPath(); ctx.arc(x + 216 + i * 22, y + 8, 8, 0, Math.PI * 2); ctx.fill();
  }
  if (g.combo >= 2) text(ctx, `combo ×${g.combo}`, x + 118, y + 34, 15, '#ffb35c', 'left', true);
}

function drawGrill(ctx, g) {
  const { grillX: x, grillY: y, grillW: w, grillH: h } = LAYOUT;
  ctx.fillStyle = '#26221f'; rr(ctx, x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#45403a'; ctx.lineWidth = 3; rr(ctx, x, y, w, h, 14); ctx.stroke();
  text(ctx, 'THE GRILL — click a golden item to plate it', x + 16, y + 22, 15, '#cfc4b4', 'left', true);
  for (let i = 0; i < 3; i++) {
    const sx = x + 22 + i * (LAYOUT.slotW + 10);
    const sy = y + 48;
    ctx.fillStyle = '#17140f'; rr(ctx, sx, sy, LAYOUT.slotW, LAYOUT.slotH, 10); ctx.fill();
    ctx.strokeStyle = '#3a352e'; ctx.lineWidth = 2;
    for (let gy = 0; gy < 4; gy++) { ctx.beginPath(); ctx.moveTo(sx + 10, sy + 24 + gy * 24); ctx.lineTo(sx + LAYOUT.slotW - 10, sy + 24 + gy * 24); ctx.stroke(); }
    const slot = g.grill[i];
    if (!slot) { text(ctx, 'empty', sx + LAYOUT.slotW / 2, sy + LAYOUT.slotH / 2, 14, '#5c554b', 'center'); continue; }
    const def = INGREDIENTS[slot.ing];
    const cx = sx + LAYOUT.slotW / 2, cy = sy + 52;
    if (slot.state === 'burnt') {
      ctx.fillStyle = '#0c0a08';
      ctx.beginPath(); ctx.ellipse(cx, cy, 34, 22, 0, 0, Math.PI * 2); ctx.fill();
      text(ctx, 'BURNT', cx, sy + LAYOUT.slotH - 18, 13, '#ff9a8a', 'center', true);
    } else {
      // Sizzle sparks while cooking.
      if (slot.state === 'raw' && g.screen === 'play') {
        ctx.fillStyle = 'rgba(255,190,90,0.8)';
        for (let s = 0; s < 3; s++) {
          const px = cx + Math.sin(g.time * 9 + s * 2.1 + i * 5) * 22;
          const py = cy - 8 - ((g.time * 30 + s * 13) % 22);
          ctx.fillRect(px, py, 3, 3);
        }
      }
      drawIngredient(ctx, slot.ing, cx, cy, 32);
      // Doneness ring: grey → gold in the perfect window → red before burnt.
      const frac = Math.min(1, slot.t / def.burn);
      ctx.strokeStyle = slot.state === 'perfect' ? '#ffd23e' : '#8a8175';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, cy, 42, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
      if (slot.state === 'perfect') {
        text(ctx, 'GOLDEN!', cx, sy + LAYOUT.slotH - 18, 14, '#ffd23e', 'center', true);
      } else {
        text(ctx, 'cooking…', cx, sy + LAYOUT.slotH - 18, 13, '#9b9184', 'center');
      }
    }
    text(ctx, `${i + 1 < 10 ? 'QWE'[i] : ''}`, sx + 12, sy + 14, 12, '#6e665b', 'left');
  }
}

function drawPlate(ctx, g) {
  const { plateCx: cx, plateCy: cy } = LAYOUT;
  text(ctx, 'YOUR PLATE', cx, 268, 17, '#ffd968', 'center', true);
  // Table mat + plate.
  ctx.fillStyle = 'rgba(20,10,4,0.35)'; rr(ctx, cx - 168, 292, 336, 232, 16); ctx.fill();
  ctx.fillStyle = '#e9e2d4';
  ctx.beginPath(); ctx.ellipse(cx, cy + 26, 138, 52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f7f2e6';
  ctx.beginPath(); ctx.ellipse(cx, cy + 18, 138, 52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9bfa9'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(cx, cy + 18, 104, 36, 0, 0, Math.PI * 2); ctx.stroke();
  // Stack the plate's ingredients in layers, buns on the bottom like a real build.
  const stackOrder = { bun: 0, lettuce: 1, patty: 2, bacon: 3, cheese: 4, tomato: 5, egg: 6 };
  const items = [...g.plate].sort((a, b) => stackOrder[a.ing] - stackOrder[b.ing]);
  items.forEach((p, i) => {
    const yy = cy + 16 - i * 13;
    drawIngredient(ctx, p.ing, cx, yy, 56);
    if (p.perfect) {
      ctx.strokeStyle = 'rgba(255,210,62,0.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, yy, 62, 36, 0, 0, Math.PI * 2); ctx.stroke();
    }
  });
  if (!items.length) text(ctx, 'click ingredients below', cx, cy + 20, 15, '#a5987f', 'center');
  // Serve flash ring.
  if (g.serveFlash > 0) {
    ctx.strokeStyle = `rgba(255,217,104,${g.serveFlash})`;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(cx, cy + 18, 150 + (1 - g.serveFlash) * 26, 62 + (1 - g.serveFlash) * 10, 0, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawButtons(ctx, g) {
  const s = LAYOUT.serveBtn, t = LAYOUT.trashBtn;
  const canServe = g.plate.length > 0;
  ctx.fillStyle = canServe ? '#3f9e4d' : '#2f6b38';
  rr(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill();
  ctx.strokeStyle = '#ffd968'; ctx.lineWidth = g.serveFlash > 0 ? 4 : 2; rr(ctx, s.x, s.y, s.w, s.h, 12); ctx.stroke();
  text(ctx, 'SERVE', s.x + s.w / 2, s.y + 28, 26, '#ffffff', 'center', true);
  text(ctx, 'space', s.x + s.w / 2, s.y + 54, 13, 'rgba(255,255,255,0.75)', 'center');
  ctx.fillStyle = '#7a3b2e'; rr(ctx, t.x, t.y, t.w, t.h, 12); ctx.fill();
  text(ctx, 'BIN PLATE', t.x + t.w / 2, t.y + t.h / 2, 18, '#ffd9cf', 'center', true);
  // Next-star progress.
  const next = STAR_TARGETS.find((v) => g.coins < v);
  text(ctx, next ? `next star at ${next} coins` : 'three stars — top chef!', s.x + s.w / 2, 522, 14, '#e8cf9f', 'center');
  if (g.messageT > 0) text(ctx, g.message, 648, 552, 20, '#ffb35c', 'center', true);
}

function drawStations(ctx, g) {
  ING_ORDER.forEach((ing, i) => {
    const d = INGREDIENTS[ing];
    const x = LAYOUT.stationX0 + i * (LAYOUT.stationW + LAYOUT.stationGap);
    const y = LAYOUT.stationY;
    ctx.fillStyle = 'rgba(24,12,4,0.55)'; rr(ctx, x + 3, y + 4, LAYOUT.stationW, LAYOUT.stationH, 12); ctx.fill();
    ctx.fillStyle = '#6e4423'; rr(ctx, x, y, LAYOUT.stationW, LAYOUT.stationH, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,160,0.35)'; ctx.lineWidth = 2; rr(ctx, x, y, LAYOUT.stationW, LAYOUT.stationH, 12); ctx.stroke();
    // A little pile of the ingredient.
    drawIngredient(ctx, ing, x + LAYOUT.stationW / 2 - 14, y + 46, 27);
    drawIngredient(ctx, ing, x + LAYOUT.stationW / 2 + 18, y + 52, 23);
    text(ctx, d.name, x + LAYOUT.stationW / 2, y + 92, 19, '#ffe9bd', 'center', true);
    text(ctx, d.grill ? `key ${d.key} · to grill` : `key ${d.key}`, x + LAYOUT.stationW / 2, y + 114, 13, '#d9b988', 'center');
  });
}

function drawFloats(ctx, g) {
  for (const f of g.floats) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.15);
    text(ctx, f.text, f.x, f.y, 22, f.color, 'center', true);
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, g) {
  ctx.fillStyle = 'rgba(24,12,4,0.72)'; ctx.fillRect(0, 0, W, H);
  // Chef hat logo.
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath();
  ctx.arc(640, 218, 44, Math.PI, 0);
  ctx.arc(596, 218, 26, Math.PI, 0);
  ctx.arc(684, 218, 26, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(588, 218, 104, 16);
  ctx.fillStyle = '#e2543e'; ctx.fillRect(588, 228, 104, 6);
  text(ctx, 'SIZZLE SHIFT', 640, 300, 64, '#ffd968', 'center', true);
  text(ctx, 'a rush-hour cooking game', 640, 344, 22, '#f3ddba', 'center');
  text(ctx, 'Orders land on the board. Build each plate from the counter,', 640, 408, 20, '#e8cf9f', 'center');
  text(ctx, 'grill patties & bacon until the ring turns GOLDEN, then serve fast', 640, 436, 20, '#e8cf9f', 'center');
  text(ctx, 'for tips. Three walk-outs end the day. Earn stars at 110 / 210 / 310 coins.', 640, 464, 20, '#e8cf9f', 'center');
  ctx.fillStyle = '#3f9e4d'; rr(ctx, 520, 508, 240, 62, 14); ctx.fill();
  text(ctx, 'START THE DAY', 640, 540, 24, '#ffffff', 'center', true);
  text(ctx, 'click or press Enter', 640, 606, 15, '#c9a877', 'center');
  // Recipe teaser row.
  RECIPES.slice(0, 4).forEach((r, i) => {
    const x = 196 + i * 232;
    ctx.fillStyle = 'rgba(247,234,208,0.92)'; rr(ctx, x, 648, 208, 84, 10); ctx.fill();
    text(ctx, r.name, x + 104, 668, 15, '#5b3413', 'center', true);
    r.items.forEach((ing, j) => drawIngredient(ctx, ing, x + 34 + j * 44, 702, 16));
  });
}

function drawOver(ctx, g) {
  ctx.fillStyle = 'rgba(24,12,4,0.78)'; ctx.fillRect(0, 0, W, H);
  text(ctx, g.strikes >= MAX_STRIKES ? 'THE DINERS GAVE UP…' : 'DAY COMPLETE!', 640, 208, 46, '#ffd968', 'center', true);
  const stars = starsFor(g.coins);
  for (let i = 0; i < 3; i++) {
    const x = 560 + i * 80, y = 282;
    ctx.fillStyle = i < stars ? '#ffd23e' : 'rgba(255,210,62,0.22)';
    ctx.beginPath();
    for (let p = 0; p < 10; p++) {
      const a = -Math.PI / 2 + (p * Math.PI) / 5;
      const rad = p % 2 === 0 ? 30 : 13;
      const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
      if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }
  text(ctx, `${g.coins} coins earned`, 640, 356, 30, '#ffe9bd', 'center', true);
  text(ctx, `plates served ${g.served}   ·   walked out ${g.lost}   ·   best combo ×${g.bestCombo}   ·   golden items ${g.perfects}`, 640, 402, 19, '#e8cf9f', 'center');
  ctx.fillStyle = '#3f9e4d'; rr(ctx, 520, 452, 240, 62, 14); ctx.fill();
  text(ctx, 'COOK AGAIN', 640, 484, 24, '#ffffff', 'center', true);
  text(ctx, 'click or press Enter', 640, 548, 15, '#c9a877', 'center');
}

function drawPause(ctx) {
  ctx.fillStyle = 'rgba(24,12,4,0.6)'; ctx.fillRect(0, 0, W, H);
  text(ctx, 'PAUSED', 640, 380, 44, '#ffd968', 'center', true);
  text(ctx, 'press P to resume', 640, 428, 18, '#f3ddba', 'center');
}

export function draw(ctx, g) {
  ctx.save();
  if (g.shake > 0) {
    const m = g.shake * 7;
    ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
  }
  drawWall(ctx, g);
  drawOrderBoard(ctx, g);
  drawHUD(ctx, g);
  drawGrill(ctx, g);
  drawPlate(ctx, g);
  drawButtons(ctx, g);
  drawStations(ctx, g);
  drawFloats(ctx, g);
  if (g.screen === 'title') drawTitle(ctx, g);
  if (g.screen === 'over') drawOver(ctx, g);
  if (g.screen === 'pause') drawPause(ctx);
  ctx.restore();
}
