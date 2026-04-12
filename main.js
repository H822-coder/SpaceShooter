/**
 * main.js — Entry point and game loop
 *
 * Manages the screen state machine, fade transitions,
 * ESC pause toggle, and the main requestAnimationFrame loop.
 */

import { ctx, WIDTH, HEIGHT, keys, resetClick, getMouse } from './canvas.js';
import { updateBackground, drawBackground } from './background.js';
import { updateParticles, drawParticles } from './particles.js';
import { setGlobalTime } from './ui.js';
import { drawHome, drawMode, drawFriends, drawRewards, drawEvents, drawScores } from './screens.js';
import { initGame, updateGame, drawGame, setPaused, gameOver, paused } from './game.js';
import { showTutorial, hideTutorial } from './tutorial.js';
import { showPause, hidePause } from './pause.js';

// --- Timing ---
let lastTime = 0;
let deltaTime = 0;
let globalTime = 0;

// --- Screen State ---
let currentScreen = 'HOME';
let gameMode = 1;

// --- Fade Transition ---
let fadeAlpha = 0;
let fadeDirection = 0; // 0=none, 1=fading out, -1=fading in
let fadeTarget = null;
let currentEventTarget = null;

/** Transition to a new screen with fade effect */
function goTo(screen, payload = null) {
  fadeTarget = screen;
  fadeDirection = 1;
  fadeAlpha = 0;
  if (screen === 'GAME') currentEventTarget = payload;
}

/** Process fade animation each frame */
function handleFade() {
  if (fadeDirection === 1) {
    fadeAlpha += deltaTime * 4;
    if (fadeAlpha >= 1) {
      fadeAlpha = 1;
      currentScreen = fadeTarget;
      fadeDirection = -1;

      // Initialize screen-specific state
      if (currentScreen === 'GAME') initGame(gameMode, currentEventTarget);
      if (currentScreen === 'TUTORIAL') showTutorial(() => goTo('HOME'));
    }
  } else if (fadeDirection === -1) {
    fadeAlpha -= deltaTime * 4;
    if (fadeAlpha <= 0) {
      fadeAlpha = 0;
      fadeDirection = 0;
      fadeTarget = null;
    }
  }
}

// --- Pause with ESC ---
window.addEventListener('keydown', e => {
  if (e.code === 'Escape' && currentScreen === 'GAME' && !gameOver) {
    e.preventDefault();
    if (paused) {
      resumeGame();
    } else {
      setPaused(true);
      showPause(
        () => resumeGame(),
        () => { hidePause(); setPaused(false); goTo('GAME'); },
        () => { hidePause(); setPaused(false); goTo('HOME'); }
      );
    }
  }
});

function resumeGame() {
  setPaused(false);
  hidePause();
}

// ═══════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════
function frame(timestamp) {
  deltaTime = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  globalTime += deltaTime;
  setGlobalTime(globalTime);

  const { x: mx, y: my, clicked } = getMouse();

  // Update background and particles (always running)
  updateBackground(deltaTime);
  updateParticles(deltaTime);
  handleFade();

  // Draw background
  drawBackground(globalTime);

  // Route to current screen
  switch (currentScreen) {
    case 'HOME':    drawHome(globalTime, mx, my, clicked, goTo); break;
    case 'MODE':    drawMode(globalTime, mx, my, clicked, goTo, m => { gameMode = m; }); break;
    case 'FRIENDS': drawFriends(globalTime, mx, my, clicked, goTo, deltaTime); break;
    case 'REWARDS': drawRewards(globalTime, mx, my, clicked, goTo); break;
    case 'EVENTS':  drawEvents(globalTime, mx, my, clicked, goTo); break;
    case 'SCORES':  drawScores(globalTime, mx, my, clicked, goTo); break;
    case 'GAME':    updateGame(deltaTime); drawGame(globalTime, mx, my, clicked, goTo); break;
    case 'TUTORIAL': break; // HTML overlay handles itself
  }

  // Particles render on top of everything
  drawParticles();

  // Fade overlay
  if (fadeAlpha > 0) {
    ctx.fillStyle = `rgba(4,6,14,${fadeAlpha})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  resetClick();
  requestAnimationFrame(frame);
}

// Start the loop
requestAnimationFrame(ts => {
  lastTime = ts;
  requestAnimationFrame(frame);
});