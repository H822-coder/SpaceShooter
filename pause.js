/**
 * pause.js — Pause overlay with glassmorphism and live stats
 *
 * Uses HTML overlay (not canvas) so we get real CSS backdrop-filter blur.
 * Shows current session stats while paused.
 */

import { stats } from './game.js';

const overlay = document.getElementById('pause-overlay');
let onResume = null, onRestart = null, onHome = null;

function getAccuracy() {
  return stats.shotsFired > 0 ? Math.floor((stats.shotsHit / stats.shotsFired) * 100) : 0;
}

function render() {
  overlay.innerHTML = `
    <h1>PAUSED</h1>
    <div class="stats-box">
      <div class="stat"><span class="stat-icon">⏱</span><span class="stat-label">Time</span><span class="stat-value">${Math.floor(stats.time)}s</span></div>
      <div class="stat"><span class="stat-icon">💀</span><span class="stat-label">Kills</span><span class="stat-value">${stats.kills}</span></div>
      <div class="stat"><span class="stat-icon">🎯</span><span class="stat-label">Accuracy</span><span class="stat-value">${getAccuracy()}%</span></div>
      <div class="stat"><span class="stat-icon">🔥</span><span class="stat-label">Best Combo</span><span class="stat-value">x${stats.bestCombo}</span></div>
    </div>
    <button class="btn accent" id="pause-resume">▶ RESUME</button>
    <button class="btn" id="pause-restart">↺ RESTART</button>
    <button class="btn danger" id="pause-home">🏠 HOME</button>
    <p style="margin-top:12px;font-size:11px;color:rgba(255,255,255,0.3);font-family:'Inter',sans-serif">Press ESC to resume</p>
  `;

  document.getElementById('pause-resume').onclick = () => onResume?.();
  document.getElementById('pause-restart').onclick = () => onRestart?.();
  document.getElementById('pause-home').onclick = () => onHome?.();
}

export function showPause(resumeFn, restartFn, homeFn) {
  onResume = resumeFn;
  onRestart = restartFn;
  onHome = homeFn;
  overlay.classList.add('visible');
  render();
}

export function hidePause() {
  overlay.classList.remove('visible');
}