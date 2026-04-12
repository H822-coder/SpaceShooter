/**
 * ui.js — Reusable UI drawing components
 *
 * Provides buttons, panels, rounded rectangles, and ship icons
 * used across all menu screens.
 */

import { ctx, WIDTH, HEIGHT } from './canvas.js';
import { boom } from './particles.js';

let globalTime = 0;

/** Update the global time used for UI animations */
export function setGlobalTime(t) { globalTime = t; }

/** Check if mouse is inside a rectangle */
export function isInside(x, y, w, h, mx, my) {
  return mx >= x && mx <= x + w && my >= y && my <= y + h;
}

/** Draw a rounded rectangle path (does NOT fill/stroke — call those after) */
export function roundedRect(x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** Draw a clickable button with hover effects and floating animation */
export function drawButton(x, y, w, h, text, mx, my, clicked, color = '#4499ff') {
  const hovered = isInside(x, y, w, h, mx, my);
  const bobY = y + Math.sin(globalTime * 2 + x * 0.01) * 3;

  // Background
  ctx.fillStyle = hovered ? color + '33' : 'rgba(255,255,255,0.06)';
  ctx.strokeStyle = hovered ? color : 'rgba(255,255,255,0.15)';
  ctx.lineWidth = hovered ? 2 : 1;
  roundedRect(x, bobY, w, h, 8);
  ctx.fill();
  ctx.stroke();

  // Label
  ctx.fillStyle = hovered ? '#fff' : 'rgba(255,255,255,0.8)';
  ctx.font = `bold ${h > 45 ? 16 : 13}px 'Orbitron', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, bobY + h / 2);
  ctx.textBaseline = 'alphabetic';

  // Click detection
  if (hovered && clicked) {
    boom(mx, my, '#fff', 6);
    return true;
  }
  return false;
}

/** Draw a glassmorphism panel with optional title */
export function drawPanel(x, y, w, h, title) {
  ctx.fillStyle = 'rgba(10,12,25,0.88)';
  ctx.strokeStyle = 'rgba(100,140,255,0.12)';
  ctx.lineWidth = 1;
  roundedRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();

  if (title) {
    ctx.fillStyle = '#fff';
    ctx.font = "bold 28px 'Orbitron', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, y + 38);
  }
}

/** Draw a small ship icon at given position and scale */
export function drawShipIcon(x, y, color, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(-8, 10);
  ctx.lineTo(-2, 5);
  ctx.lineTo(2, 5);
  ctx.lineTo(8, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}