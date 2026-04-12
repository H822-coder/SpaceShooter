/**
 * canvas.js — Canvas setup, input handling, and math utilities
 *
 * Internal resolution is fixed at 960x540 (16:9).
 * CSS scales the canvas to fill the viewport.
 */

// --- Canvas ---
export const canvas = document.getElementById("game");
export const ctx = canvas.getContext("2d");
export const WIDTH = 960;
export const HEIGHT = 540;
canvas.width = WIDTH;
canvas.height = HEIGHT;

// --- Math Utilities ---
export const rand = (min, max) => Math.random() * (max - min) + min;
export const clamp = (val, lo, hi) => Math.max(lo, Math.min(hi, val));
export const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

// --- Keyboard Input ---
export const keys = {};
window.addEventListener("keydown", e => {
  keys[e.code] = true;
  const blocked = ['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (blocked.includes(e.code)) e.preventDefault();
});
window.addEventListener("keyup", e => { keys[e.code] = false; });

// --- Mouse Input ---
let mouseX = 0, mouseY = 0, mouseClicked = false;

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * (WIDTH / rect.width);
  mouseY = (e.clientY - rect.top) * (HEIGHT / rect.height);
});

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * (WIDTH / rect.width);
  mouseY = (e.clientY - rect.top) * (HEIGHT / rect.height);
  mouseClicked = true;
});

export function getMouse() {
  return { x: mouseX, y: mouseY, clicked: mouseClicked };
}

export function resetClick() {
  mouseClicked = false;
}