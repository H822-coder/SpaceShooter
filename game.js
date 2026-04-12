/**
 * game.js — Core gameplay logic
 *
 * Contains all gameplay systems: players, enemies, lasers, power-ups,
 * mini-ships, collisions, antigravity physics, HUD, and game-over.
 * Stats are tracked for persistence via save.js.
 */

import { ctx, WIDTH, HEIGHT, keys, rand, clamp, dist } from './canvas.js';
import { boom, addShockwave, addPopup } from './particles.js';
import { drawButton, roundedRect, setGlobalTime } from './ui.js';
import { addScore, updateLifetimeStats } from './save.js';

// === Exported game state ===
export let score = 0;
export let gameOver = false;
export let paused = false;
export let players = [];
export let stats = { kills: 0, shotsFired: 0, shotsHit: 0, bestCombo: 0, time: 0, bossKills: 0 };

// === Internal state ===
let enemyCount = 0, spawnTimer = 0;
let currentEvent = null;
let lasers = [], enemies = [], powerUps = [], trails = [];
let shake = 0, flash = 0;

export function setPaused(val) { paused = val; }

// --- Player factory ---
function createPlayer(id, color, accent, up, down, left, right, shoot, pulse) {
  return {
    id, color, accent,
    x: id === 0 ? WIDTH * 0.35 : WIDTH * 0.65,
    y: HEIGHT * 0.8,
    w: 28, h: 32,
    lives: 3, alive: true,
    invincibleTimer: 0, shootCooldown: 0, tilt: 0,
    // Control keys
    up, down, left, right, shoot, pulse,
    // Antigravity
    pulseActive: false, pulseRadius: 150,
    // Power-up
    powered: false, powerTimer: 0,
    // Combo system
    combo: 0, comboTimer: 0,
    swarmActive: false, swarmTimer: 0, miniShips: []
  };
}

/** Initialize a fresh game session */
export function initGame(mode, eventKey = null) {
  score = 0; gameOver = false; paused = false;
  enemyCount = 0; spawnTimer = 0;
  currentEvent = eventKey;
  lasers = []; enemies = []; powerUps = []; trails = [];
  stats = { kills: 0, shotsFired: 0, shotsHit: 0, bestCombo: 0, time: 0, bossKills: 0 };
  shake = 0; flash = 0;

  players = [
    createPlayer(0, '#4499ff', '#88ccff', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space', 'KeyF')
  ];
  if (mode === 2) {
    players.push(
      createPlayer(1, '#33dd66', '#88ffaa', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'ShiftRight')
    );
  }
}

// --- Entity factories ---
function createLaser(x, y, owner) { return { x, y, w: 3, h: 14, owner }; }
function createMiniShip(owner) {
  return { x: owner.x + rand(-10, 10), y: owner.y - 10, vx: rand(-40, 40), vy: -60, w: 10, h: 12, owner };
}

// --- AABB collision ---
function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax - aw/2 < bx + bw/2 && ax + aw/2 > bx - bw/2 &&
         ay - ah/2 < by + bh/2 && ay + ah/2 > by - bh/2;
}

/** Handle a kill: score, particles, combo, power-up drop */
function registerKill(player, enemy) {
  const points = enemy.isCarrier ? 25 : 10;
  score += points;
  stats.kills++;
  stats.shotsHit++;
  if (enemy.isCarrier) stats.bossKills++;

  boom(enemy.x, enemy.y, enemy.color, enemy.isCarrier ? 22 : 12, true);
  addShockwave(enemy.x, enemy.y,
    enemy.isCarrier ? 'rgba(187,85,255,0.5)' : 'rgba(255,68,85,0.4)',
    enemy.isCarrier ? 80 : 50
  );
  addPopup(enemy.x, enemy.y - 15, '+' + points);

  // Carrier drops a power-up
  if (enemy.isCarrier) {
    powerUps.push({ x: enemy.x, y: enemy.y, w: 18, h: 18, vy: 80, time: 0 });
  }

  // Combo streak
  player.combo++;
  player.comboTimer = 3;
  if (player.combo > stats.bestCombo) stats.bestCombo = player.combo;

  // Swarm activation at 15x combo
  if (player.combo >= 15 && !player.swarmActive) {
    player.swarmActive = true;
    player.swarmTimer = 5;
    player.combo = 0;
    player.miniShips.length = 0;
  }
}

// ═══════════════════════════════════════════════════
//  UPDATE
// ═══════════════════════════════════════════════════
export function updateGame(dt) {
  if (gameOver || paused) return;
  stats.time += dt;

  // --- Spawn enemies ---
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnTimer = currentEvent === 'meteor' ? 0.35 : 0.7;
    enemyCount++;
    const isCarrier = currentEvent === 'boss' ? true : (enemyCount % 10 === 0);
    const w = isCarrier ? 36 : 22, h = isCarrier ? 30 : 20;
    enemies.push({
      x: rand(w, WIDTH - w), y: -h, w, h,
      vx: 0, vy: rand(56, 104),
      hp: isCarrier ? 2 : 1, isCarrier,
      color: isCarrier ? '#bb55ff' : '#ff4455'
    });
  }

  // --- Update players ---
  for (const p of players) {
    if (!p.alive) continue;

    // Movement
    let dx = 0, dy = 0;
    if (keys[p.up]) dy -= 1;
    if (keys[p.down]) dy += 1;
    if (keys[p.left]) dx -= 1;
    if (keys[p.right]) dx += 1;
    const magnitude = Math.hypot(dx, dy) || 1;
    p.x += (dx / magnitude) * 220 * dt;
    p.y += (dy / magnitude) * 220 * dt;
    p.x = clamp(p.x, p.w / 2, WIDTH - p.w / 2);
    p.y = clamp(p.y, HEIGHT * 0.4, HEIGHT - p.h / 2);
    p.tilt = dx * 0.25; // Visual tilt

    // Engine trail particles (always, stronger when moving)
    if (Math.hypot(dx, dy) > 0) {
      trails.push({ x: p.x + rand(-4, 4), y: p.y + p.h / 2 + 2, vx: rand(-12, 12), vy: rand(30, 70), life: 0.3, maxLife: 0.3, size: rand(1.2, 3), color: p.accent });
    }
    if (Math.random() < 0.6) {
      trails.push({ x: p.x + rand(-3, 3), y: p.y + p.h / 2, vx: rand(-8, 8), vy: rand(40, 90), life: 0.18, maxLife: 0.18, size: rand(1, 2.5), color: Math.random() > 0.5 ? '#ff8844' : p.accent });
    }

    // Shooting
    p.shootCooldown -= dt;
    if (keys[p.shoot] && p.shootCooldown <= 0) {
      p.shootCooldown = 0.18;
      stats.shotsFired++;
      if (p.powered) {
        lasers.push(createLaser(p.x - 7, p.y - p.h / 2, p));
        lasers.push(createLaser(p.x + 7, p.y - p.h / 2, p));
        stats.shotsFired++;
      } else {
        lasers.push(createLaser(p.x, p.y - p.h / 2, p));
      }
    }

    // Antigravity pulse
    p.pulseActive = !!keys[p.pulse];
    p.pulseRadius = p.powered ? 300 : 150;

    // Power-up timer
    if (p.powered) { p.powerTimer -= dt; if (p.powerTimer <= 0) p.powered = false; }
    if (p.invincibleTimer > 0) p.invincibleTimer -= dt;

    // Combo decay
    if (p.combo > 0) { p.comboTimer -= dt; if (p.comboTimer <= 0) p.combo = 0; }

    // Swarm mode
    if (p.swarmActive) {
      p.swarmTimer -= dt;
      if (p.swarmTimer <= 0) { p.swarmActive = false; p.miniShips.length = 0; }
      else {
        while (p.miniShips.length < 3) p.miniShips.push(createMiniShip(p));
        for (let i = p.miniShips.length - 1; i >= 0; i--) {
          const m = p.miniShips[i];
          // Find closest enemy
          let closest = null, closestDist = Infinity;
          for (const e of enemies) {
            const d = dist(m.x, m.y, e.x, e.y);
            if (d < closestDist) { closestDist = d; closest = e; }
          }
          // Steer toward target
          if (closest) {
            const ddx = closest.x - m.x, ddy = closest.y - m.y;
            const mag = Math.hypot(ddx, ddy) || 1;
            m.vx += (ddx / mag) * 600 * dt;
            m.vy += (ddy / mag) * 600 * dt;
          } else { m.vy -= 100 * dt; }

          // Cap speed
          const speed = Math.hypot(m.vx, m.vy);
          if (speed > 260) { m.vx = (m.vx / speed) * 260; m.vy = (m.vy / speed) * 260; }
          m.x += m.vx * dt; m.y += m.vy * dt;
          if (m.y < -30 || m.y > HEIGHT + 30 || m.x < -30 || m.x > WIDTH + 30) p.miniShips.splice(i, 1);
        }
      }
    }
  }

  // --- Update entities ---
  for (let i = lasers.length - 1; i >= 0; i--) { lasers[i].y -= 500 * dt; if (lasers[i].y + 14 < 0) lasers.splice(i, 1); }
  for (let i = enemies.length - 1; i >= 0; i--) { const e = enemies[i]; e.x += e.vx * dt; e.y += e.vy * dt; e.vx *= 0.96; if (e.y > HEIGHT + 40 || e.x < -60 || e.x > WIDTH + 60) enemies.splice(i, 1); }
  for (let i = powerUps.length - 1; i >= 0; i--) { const pu = powerUps[i]; pu.y += pu.vy * dt; pu.time += dt; if (pu.y > HEIGHT + 20) powerUps.splice(i, 1); }
  for (let i = trails.length - 1; i >= 0; i--) { const t = trails[i]; t.x += t.vx * dt; t.y += t.vy * dt; t.life -= dt; if (t.life <= 0) trails.splice(i, 1); }
  if (flash > 0) flash -= dt * 4;

  // --- Antigravity repulsion ---
  for (const p of players) {
    if (!p.alive || !p.pulseActive) continue;
    const forceMul = p.powered ? 2 : 1;
    for (const e of enemies) {
      const d = dist(p.x, p.y, e.x, e.y);
      if (d < p.pulseRadius && d > 1) {
        const strength = (1 - d / p.pulseRadius) * 450 * forceMul;
        e.vx += ((e.x - p.x) / d) * strength * dt;
        e.vy += ((e.y - p.y) / d) * strength * dt;
      }
    }
  }

  // --- Collisions ---
  // Laser → Enemy
  for (let li = lasers.length - 1; li >= 0; li--) {
    const l = lasers[li];
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      if (aabb(l.x, l.y + 7, l.w, l.h, enemies[ei].x, enemies[ei].y, enemies[ei].w, enemies[ei].h)) {
        lasers.splice(li, 1);
        enemies[ei].hp--;
        if (enemies[ei].hp <= 0) { registerKill(l.owner, enemies[ei]); enemies.splice(ei, 1); }
        break;
      }
    }
  }
  // Enemy → Player
  for (const p of players) {
    if (!p.alive || p.invincibleTimer > 0) continue;
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      if (aabb(p.x, p.y, p.w, p.h, enemies[ei].x, enemies[ei].y, enemies[ei].w, enemies[ei].h)) {
        p.lives--; p.invincibleTimer = 1;
        boom(p.x, p.y, p.color, 18, true); shake = Math.max(shake, 6); flash = 0.3;
        enemies.splice(ei, 1);
        if (p.lives <= 0) { p.alive = false; boom(p.x, p.y, '#fff', 30, true); shake = 10; flash = 0.5; }
        break;
      }
    }
  }
  // MiniShip → Enemy
  for (const p of players) {
    for (let mi = p.miniShips.length - 1; mi >= 0; mi--) {
      const m = p.miniShips[mi];
      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        if (aabb(m.x, m.y, m.w, m.h, enemies[ei].x, enemies[ei].y, enemies[ei].w, enemies[ei].h)) {
          enemies[ei].hp--; boom(m.x, m.y, '#ffdd44', 8); p.miniShips.splice(mi, 1);
          if (enemies[ei].hp <= 0) { registerKill(p, enemies[ei]); enemies.splice(ei, 1); }
          break;
        }
      }
    }
  }
  // Player → PowerUp
  for (const p of players) {
    if (!p.alive) continue;
    for (let pi = powerUps.length - 1; pi >= 0; pi--) {
      if (aabb(p.x, p.y, p.w + 10, p.h + 10, powerUps[pi].x, powerUps[pi].y, powerUps[pi].w, powerUps[pi].h)) {
        p.powered = true; p.powerTimer = 10;
        boom(powerUps[pi].x, powerUps[pi].y, '#ffcc33', 14);
        addPopup(powerUps[pi].x, powerUps[pi].y - 10, 'POWER UP!', '#ff8844');
        powerUps.splice(pi, 1);
      }
    }
  }

  // --- Game over ---
  if (players.every(p => !p.alive)) {
    gameOver = true;
    addScore(score);
    updateLifetimeStats(stats.kills, stats.time, stats.bestCombo, stats.bossKills);
  }
}

// ═══════════════════════════════════════════════════
//  DRAW
// ═══════════════════════════════════════════════════
export function drawGame(gt, mx, my, cl, goTo) {
  setGlobalTime(gt);
  ctx.save();

  // Screen shake
  if (shake > 0) {
    ctx.translate(rand(-shake, shake), rand(-shake, shake));
    shake *= 0.85;
    if (shake < 0.5) shake = 0;
  }

  // Engine trails
  for (const t of trails) {
    const a = clamp(t.life / t.maxLife, 0, 1);
    ctx.globalAlpha = a * 0.6; ctx.fillStyle = t.color;
    ctx.beginPath(); ctx.arc(t.x, t.y, t.size * a, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Lasers with glow
  for (const l of lasers) {
    ctx.globalAlpha = 0.15; ctx.fillStyle = l.owner.accent; ctx.fillRect(l.x - 4, l.y, 8, 20);
    ctx.globalAlpha = 1; ctx.shadowColor = l.owner.accent; ctx.shadowBlur = 12;
    ctx.fillStyle = '#fff'; ctx.fillRect(l.x - 1.5, l.y, 3, 14); ctx.shadowBlur = 0;
  }

  // Enemies
  for (const e of enemies) {
    ctx.fillStyle = e.color;
    if (e.isCarrier) {
      ctx.beginPath(); ctx.moveTo(e.x, e.y - e.h/2); ctx.lineTo(e.x + e.w/2, e.y);
      ctx.lineTo(e.x, e.y + e.h/2); ctx.lineTo(e.x - e.w/2, e.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(220,160,255,0.5)'; ctx.beginPath(); ctx.arc(e.x, e.y, 6, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(e.x, e.y + e.h/2); ctx.lineTo(e.x - e.w/2, e.y - e.h/2);
      ctx.lineTo(e.x + e.w/2, e.y - e.h/2); ctx.closePath(); ctx.fill();
    }
  }

  // Power-ups
  for (const pu of powerUps) {
    const pulse = 0.8 + 0.2 * Math.sin(pu.time * 6);
    ctx.save(); ctx.translate(pu.x, pu.y); ctx.rotate(pu.time * 2); ctx.scale(pulse, pulse);
    ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 16; ctx.fillStyle = '#ffcc33';
    ctx.fillRect(-9, -9, 18, 18); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(5, 0);
    ctx.lineTo(0, 5); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  // Mini ships
  for (const p of players) {
    for (const m of p.miniShips) {
      ctx.fillStyle = '#ffdd44';
      ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(Math.atan2(m.vy, m.vx) + Math.PI / 2);
      ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(-5, 6); ctx.lineTo(5, 6); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  // Players
  for (const p of players) {
    if (!p.alive) continue;
    if (p.invincibleTimer > 0 && Math.sin(p.invincibleTimer * 20) > 0) continue;

    // Antigravity pulse aura
    if (p.pulseActive) {
      const pc = p.powered ? 'rgba(255,60,60,' : 'rgba(80,140,255,';
      const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.pulseRadius);
      gr.addColorStop(0, pc + '0.14)'); gr.addColorStop(0.7, pc + '0.06)'); gr.addColorStop(1, pc + '0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, p.pulseRadius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = p.powered ? 'rgba(255,80,80,0.5)' : 'rgba(100,160,255,0.4)';
      ctx.lineWidth = 1.5; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.pulseRadius * (0.9 + 0.1 * Math.sin(gt * 4)), gt * 2, gt * 2 + Math.PI * 1.8); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Ship hull with tilt
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.tilt);
    const gl = ctx.createRadialGradient(0, p.h * 0.3, 0, 0, p.h * 0.5, 14);
    gl.addColorStop(0, p.accent); gl.addColorStop(1, 'transparent');
    ctx.fillStyle = gl; ctx.fillRect(-8, p.h * 0.15, 16, 20);
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.moveTo(0, -p.h/2); ctx.lineTo(-p.w/2, p.h/2);
    ctx.lineTo(-p.w*0.15, p.h*0.25); ctx.lineTo(p.w*0.15, p.h*0.25); ctx.lineTo(p.w/2, p.h/2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(0, -2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Status text
    if (p.combo > 0) {
      ctx.fillStyle = '#ffcc00'; ctx.font = "bold 14px 'Orbitron', monospace";
      ctx.textAlign = 'center'; ctx.fillText('x' + p.combo, p.x, p.y - p.h/2 - 12);
    }
    if (p.swarmActive) {
      ctx.fillStyle = 'rgba(255,220,50,0.9)'; ctx.font = "bold 11px 'Orbitron', monospace";
      ctx.textAlign = 'center'; ctx.fillText('⚡ SWARM ⚡', p.x, p.y - p.h/2 - 26);
    }
    if (p.powered) {
      ctx.fillStyle = 'rgba(255,100,100,0.85)'; ctx.font = "bold 10px 'Orbitron', monospace";
      ctx.textAlign = 'center'; ctx.fillText('POWER ' + p.powerTimer.toFixed(1) + 's', p.x, p.y + p.h/2 + 15);
    }
  }

  // --- HUD ---
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, WIDTH, 42);
  ctx.fillStyle = '#fff'; ctx.font = "bold 18px 'Orbitron', monospace"; ctx.textAlign = 'center';
  ctx.fillText('SCORE  ' + score, WIDTH / 2, 28);

  for (const p of players) {
    const bx = p.id === 0 ? 16 : WIDTH - 130;
    ctx.fillStyle = p.color; ctx.font = "bold 12px 'Orbitron', monospace"; ctx.textAlign = 'left';
    ctx.fillText('P' + (p.id + 1), bx, 17);
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = i < p.lives ? 1 : 0.2; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(bx + 30 + i * 18, 13, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (p.combo > 0) {
      const fill = clamp(p.combo / 15, 0, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(bx, 24, 80, 5);
      ctx.fillStyle = fill >= 1 ? '#ffdd44' : p.accent; ctx.fillRect(bx, 24, 80 * fill, 5);
    }
  }

  // Bottom stats bar
  const acc = stats.shotsFired > 0 ? Math.floor((stats.shotsHit / stats.shotsFired) * 100) : 0;
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = "11px 'Inter', sans-serif"; ctx.textAlign = 'left';
  ctx.fillText(`⏱ ${Math.floor(stats.time)}s`, 16, HEIGHT - 9);
  ctx.fillText(`💀 ${stats.kills}`, 90, HEIGHT - 9);
  ctx.fillText(`🎯 ${acc}%`, 150, HEIGHT - 9);
  ctx.fillText(`🔥 ${stats.bestCombo}`, 210, HEIGHT - 9);
  ctx.textAlign = 'right'; ctx.fillText('ESC to pause', WIDTH - 12, HEIGHT - 9);

  // Screen flash
  if (flash > 0) { ctx.globalAlpha = flash * 0.3; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, WIDTH, HEIGHT); ctx.globalAlpha = 1; }

  // Game over overlay
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#ff4466'; ctx.font = "bold 48px 'Orbitron', monospace"; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2 - 50);
    ctx.fillStyle = '#fff'; ctx.font = "22px 'Inter', sans-serif";
    ctx.fillText('Score: ' + score, WIDTH / 2, HEIGHT / 2 - 10);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "14px 'Inter', sans-serif";
    ctx.fillText(`Kills: ${stats.kills}  |  Accuracy: ${acc}%  |  Best Combo: ${stats.bestCombo}`, WIDTH / 2, HEIGHT / 2 + 20);
    if (drawButton(WIDTH / 2 - 90, HEIGHT / 2 + 45, 180, 44, '🏠 HOME', mx, my, cl, '#4499ff')) goTo('HOME');
  }

  ctx.restore();
}