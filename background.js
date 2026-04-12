/**
 * background.js — Animated space background
 *
 * Renders a starfield with colored twinkling and
 * slow-moving nebula clouds using radial gradients.
 */

import { ctx, WIDTH, HEIGHT, rand } from './canvas.js';

// Generate star array with random properties
const stars = Array.from({ length: 200 }, () => ({
  x: rand(0, WIDTH),
  y: rand(0, HEIGHT),
  speed: rand(25, 140),
  size: rand(0.4, 2.4),
  brightness: rand(0.3, 1),
  hue: rand(0, 360)
}));

// Generate nebula clouds
const nebulae = Array.from({ length: 8 }, () => ({
  x: rand(0, WIDTH),
  y: rand(0, HEIGHT),
  radius: rand(80, 240),
  hue: rand(0, 360),
  speed: rand(2, 8),
  alpha: rand(0.018, 0.05)
}));

/** Move stars and nebulae downward */
export function updateBackground(dt) {
  for (const star of stars) {
    star.y += star.speed * dt;
    if (star.y > HEIGHT) {
      star.y = 0;
      star.x = rand(0, WIDTH);
    }
  }

  for (const neb of nebulae) {
    neb.y += neb.speed * dt;
    if (neb.y - neb.radius > HEIGHT) {
      neb.y = -neb.radius;
      neb.x = rand(0, WIDTH);
    }
  }
}

/** Render background: dark fill → nebulae → stars with glow */
export function drawBackground(time) {
  ctx.fillStyle = '#04060e';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Nebulae (radial gradient blobs)
  for (const neb of nebulae) {
    const gradient = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
    gradient.addColorStop(0, `hsla(${neb.hue},70%,45%,${neb.alpha})`);
    gradient.addColorStop(1, `hsla(${neb.hue},70%,45%,0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stars with twinkling effect
  for (const star of stars) {
    const twinkle = 0.6 + 0.4 * Math.sin(time * 3 + star.x * 0.1 + star.y * 0.05);
    ctx.globalAlpha = star.brightness * twinkle;

    const isBright = star.brightness > 0.8;
    ctx.fillStyle = isBright ? `hsl(${star.hue},60%,85%)` : '#fff';
    ctx.fillRect(star.x, star.y, star.size, star.size);

    // Glow halo for bright, large stars
    if (isBright && star.size > 1.5) {
      ctx.globalAlpha = star.brightness * twinkle * 0.15;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}