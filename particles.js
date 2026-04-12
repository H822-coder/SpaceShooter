/**
 * particles.js — Visual effects system
 *
 * Handles three types of effects:
 * 1. Particles — small dots for explosions and trails
 * 2. Shockwaves — expanding rings on enemy death
 * 3. Popups — floating text like "+10" on kills
 */

import { ctx, rand, clamp } from './canvas.js';

export const particles = [];
export const shockwaves = [];
export const popups = [];

/** Spawn an explosion burst at (x, y) */
export function boom(x, y, color, count = 12, multiColor = false) {
  const palette = multiColor ? [color, '#fff', '#ffaa44', '#ff6688'] : [color];

  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(40, 200);
    const life = rand(0.2, 0.65);

    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size: rand(1.5, 5),
      color: palette[Math.floor(rand(0, palette.length))]
    });
  }
}

/** Spawn an expanding shockwave ring */
export function addShockwave(x, y, color = 'rgba(255,255,255,0.4)', maxRadius = 60) {
  shockwaves.push({ x, y, radius: 5, maxRadius, life: 0.4, maxLife: 0.4, color });
}

/** Spawn a floating text popup (e.g. "+10") */
export function addPopup(x, y, text, color = '#ffcc33') {
  popups.push({ x, y, text, color, life: 0.8, maxLife: 0.8 });
}

/** Update all active effects */
export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const s = shockwaves[i];
    s.life -= dt;
    s.radius += (s.maxRadius - 5) * (dt / s.maxLife) * 1.5;
    if (s.life <= 0) shockwaves.splice(i, 1);
  }

  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y -= 40 * dt;
    p.life -= dt;
    if (p.life <= 0) popups.splice(i, 1);
  }
}

/** Render all active effects */
export function drawParticles() {
  // Particle dots
  for (const p of particles) {
    const alpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shockwave rings
  for (const s of shockwaves) {
    const alpha = clamp(s.life / s.maxLife, 0, 1);
    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2 * alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Floating text popups
  for (const p of popups) {
    const alpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.font = "bold 14px 'Orbitron', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y);
  }

  ctx.globalAlpha = 1;
}