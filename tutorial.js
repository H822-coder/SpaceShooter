/**
 * tutorial.js — Interactive 5-step tutorial with animated demos
 *
 * Each step shows an animated canvas preview demonstrating the mechanic,
 * plus text explanation and key badges.
 */

const STEPS = [
  {
    title: "MOVEMENT",
    step: "STEP 1 OF 5",
    text: "Use movement keys to fly your ship around the bottom of the screen. Dodge incoming enemies!",
    keys1: ["W", "A", "S", "D"], keys2: ["↑", "←", "↓", "→"],
    label: "Player 1: WASD  •  Player 2: Arrow Keys",
    anim: "move"
  },
  {
    title: "SHOOTING",
    step: "STEP 2 OF 5",
    text: "Press your fire key to unleash rapid lasers upward. Destroy enemies before they reach you!",
    keys1: ["SPACE"], keys2: ["ENTER"],
    label: "Player 1: SPACE  •  Player 2: ENTER",
    anim: "shoot"
  },
  {
    title: "ANTIGRAVITY PULSE",
    step: "STEP 3 OF 5",
    text: "Hold the pulse key to create a repulsion field. Enemies inside are pushed away — closer = stronger!",
    keys1: ["F"], keys2: ["R-SHIFT"],
    label: "Player 1: F  •  Player 2: Right Shift",
    anim: "pulse"
  },
  {
    title: "POWER-UPS",
    step: "STEP 4 OF 5",
    text: "Every 10th enemy is a purple Carrier (2× HP). Destroy it to drop a power-up — Double Cannon + Overcharged Pulse for 10s!",
    keys1: [], keys2: [],
    label: "Purple ◆ = Carrier → Gold ▣ = Power-Up",
    anim: "powerup"
  },
  {
    title: "COMBO & SWARM",
    step: "STEP 5 OF 5",
    text: "Kill enemies quickly to build combos (3s timeout). At 15× combo, Swarm Mode activates: 3 homing drones attack for 5 seconds!",
    keys1: [], keys2: [],
    label: "Watch the combo bar — fill it to unleash the swarm!",
    anim: "combo"
  }
];

let currentStep = 0;
let onCloseCallback = null;
let animCanvas = null;
let animCtx = null;
let animFrame = 0;

const overlay = document.getElementById('tutorial-overlay');

/** Create the animation preview canvas */
function getAnimCanvas() {
  if (!animCanvas) {
    animCanvas = document.createElement('canvas');
    animCanvas.width = 260;
    animCanvas.height = 140;
    animCanvas.style.cssText = 'border-radius:8px;border:1px solid rgba(100,160,255,0.15);background:#0a0e1e;margin:12px auto;display:block';
  }
  return animCanvas;
}

/** Draw animated demo for each step */
function drawAnimFrame() {
  const ac = getAnimCanvas();
  const ax = animCtx || (animCtx = ac.getContext('2d'));
  const w = 260, h = 140;
  ax.clearRect(0, 0, w, h);
  ax.fillStyle = '#0a0e1e'; ax.fillRect(0, 0, w, h);
  animFrame++;
  const t = animFrame / 60;

  const step = STEPS[currentStep];

  if (step.anim === 'move') {
    // Ship moving in circle
    const sx = w/2 + Math.cos(t * 2) * 60;
    const sy = h/2 + Math.sin(t * 2) * 30;
    ax.fillStyle = '#4499ff';
    ax.beginPath(); ax.moveTo(sx, sy - 10); ax.lineTo(sx - 7, sy + 8); ax.lineTo(sx + 7, sy + 8); ax.closePath(); ax.fill();
    // Trail
    for (let i = 0; i < 5; i++) {
      ax.globalAlpha = 0.15 - i * 0.03;
      const tx = w/2 + Math.cos(t * 2 - i * 0.15) * 60;
      const ty = h/2 + Math.sin(t * 2 - i * 0.15) * 30 + 10;
      ax.fillStyle = '#88ccff'; ax.beginPath(); ax.arc(tx, ty, 2, 0, Math.PI * 2); ax.fill();
    }
    ax.globalAlpha = 1;
    // Arrows showing direction
    ax.strokeStyle = 'rgba(255,255,255,0.2)'; ax.lineWidth = 1;
    ax.setLineDash([4, 4]);
    ax.beginPath(); ax.arc(w/2, h/2, 50, 0, Math.PI * 2); ax.stroke();
    ax.setLineDash([]);
  }

  else if (step.anim === 'shoot') {
    // Ship firing lasers at enemies
    const shipY = h - 25;
    ax.fillStyle = '#4499ff';
    ax.beginPath(); ax.moveTo(w/2, shipY - 10); ax.lineTo(w/2 - 7, shipY + 8); ax.lineTo(w/2 + 7, shipY + 8); ax.closePath(); ax.fill();
    // Lasers
    for (let i = 0; i < 3; i++) {
      const ly = (shipY - 20 - (animFrame * 3 + i * 40) % 100);
      if (ly > 0) {
        ax.fillStyle = '#88ccff'; ax.shadowColor = '#88ccff'; ax.shadowBlur = 6;
        ax.fillRect(w/2 - 1, ly, 2, 10); ax.shadowBlur = 0;
      }
    }
    // Enemies
    for (let i = 0; i < 3; i++) {
      const ex = 60 + i * 80, ey = 20 + Math.sin(t + i) * 10;
      ax.fillStyle = '#ff4455';
      ax.beginPath(); ax.moveTo(ex, ey + 8); ax.lineTo(ex - 8, ey - 8); ax.lineTo(ex + 8, ey - 8); ax.closePath(); ax.fill();
    }
  }

  else if (step.anim === 'pulse') {
    // Ship with expanding pulse ring
    const pulseR = 30 + 20 * (0.5 + 0.5 * Math.sin(t * 3));
    ax.fillStyle = '#4499ff';
    ax.beginPath(); ax.moveTo(w/2, h/2 - 10); ax.lineTo(w/2 - 7, h/2 + 8); ax.lineTo(w/2 + 7, h/2 + 8); ax.closePath(); ax.fill();
    // Pulse circle
    const gr = ax.createRadialGradient(w/2, h/2, 0, w/2, h/2, pulseR);
    gr.addColorStop(0, 'rgba(80,140,255,0.15)'); gr.addColorStop(1, 'rgba(80,140,255,0)');
    ax.fillStyle = gr; ax.beginPath(); ax.arc(w/2, h/2, pulseR, 0, Math.PI * 2); ax.fill();
    ax.strokeStyle = 'rgba(100,160,255,0.4)'; ax.lineWidth = 1;
    ax.beginPath(); ax.arc(w/2, h/2, pulseR, 0, Math.PI * 2); ax.stroke();
    // Enemies being pushed
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i + t * 0.5;
      const pushDist = pulseR + 15 + Math.sin(t * 2) * 8;
      const ex = w/2 + Math.cos(angle) * pushDist;
      const ey = h/2 + Math.sin(angle) * pushDist * 0.7;
      if (ex > 5 && ex < w - 5 && ey > 5 && ey < h - 5) {
        ax.fillStyle = '#ff4455';
        ax.beginPath(); ax.moveTo(ex, ey + 6); ax.lineTo(ex - 6, ey - 6); ax.lineTo(ex + 6, ey - 6); ax.closePath(); ax.fill();
      }
    }
  }

  else if (step.anim === 'powerup') {
    // Carrier dropping powerup
    const dropY = 20 + (animFrame % 90);
    ax.fillStyle = '#bb55ff';
    ax.beginPath(); ax.moveTo(w/2, 10); ax.lineTo(w/2 + 15, 25); ax.lineTo(w/2, 40); ax.lineTo(w/2 - 15, 25); ax.closePath(); ax.fill();
    if (dropY > 45) {
      const pulse = 0.8 + 0.2 * Math.sin(t * 6);
      ax.save(); ax.translate(w/2, dropY); ax.rotate(t * 2); ax.scale(pulse, pulse);
      ax.fillStyle = '#ffcc33'; ax.fillRect(-6, -6, 12, 12);
      ax.restore();
    }
    // Ship at bottom
    ax.fillStyle = '#4499ff';
    ax.beginPath(); ax.moveTo(w/2, h - 25); ax.lineTo(w/2 - 7, h - 10); ax.lineTo(w/2 + 7, h - 10); ax.closePath(); ax.fill();
  }

  else if (step.anim === 'combo') {
    // Combo counter incrementing
    const count = Math.floor(t * 3) % 16;
    ax.fillStyle = '#4499ff';
    ax.beginPath(); ax.moveTo(w/2, h - 25); ax.lineTo(w/2 - 7, h - 10); ax.lineTo(w/2 + 7, h - 10); ax.closePath(); ax.fill();
    ax.fillStyle = '#ffcc00'; ax.font = "bold 16px 'Orbitron', monospace"; ax.textAlign = 'center';
    ax.fillText('x' + Math.min(count, 15), w/2, h - 35);
    // Combo bar
    const barFill = Math.min(count / 15, 1);
    ax.fillStyle = 'rgba(255,255,255,0.1)'; ax.fillRect(w/2 - 50, h - 55, 100, 6);
    ax.fillStyle = barFill >= 1 ? '#ffdd44' : '#88ccff'; ax.fillRect(w/2 - 50, h - 55, 100 * barFill, 6);
    // Mini ships when swarm activates
    if (count >= 15) {
      for (let i = 0; i < 3; i++) {
        const mx = w/2 + Math.cos(t * 4 + i * 2.1) * 40;
        const my2 = 40 + Math.sin(t * 3 + i * 1.5) * 20;
        ax.fillStyle = '#ffdd44';
        ax.beginPath(); ax.moveTo(mx, my2 - 5); ax.lineTo(mx - 4, my2 + 5); ax.lineTo(mx + 4, my2 + 5); ax.closePath(); ax.fill();
      }
      ax.fillStyle = 'rgba(255,220,50,0.8)'; ax.font = "bold 10px 'Orbitron', monospace";
      ax.fillText('⚡ SWARM ⚡', w/2, h - 65);
    }
  }

  requestAnimationFrame(drawAnimFrame);
}

function render() {
  const s = STEPS[currentStep];

  const dotsHTML = STEPS.map((_, i) =>
    `<div class="dot ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}"></div>`
  ).join('');

  const keysHTML = s.keys1.length > 0 ? `
    <div class="keys">
      ${s.keys1.map(k => `<span class="key-badge">${k}</span>`).join('')}
      <span style="color:rgba(255,255,255,0.3);margin:0 6px">|</span>
      ${s.keys2.map(k => `<span class="key-badge">${k}</span>`).join('')}
    </div>` : '';

  overlay.innerHTML = `
    <div class="tutorial-card">
      <div class="step-num">${s.step}</div>
      <h2>${s.title}</h2>
      <div class="tutorial-dots">${dotsHTML}</div>
      <div id="anim-container"></div>
      <p>${s.text}</p>
      ${keysHTML}
      <p style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:18px">${s.label}</p>
      <div class="tutorial-nav">
        ${currentStep > 0 ? '<button class="btn" id="tut-prev">← PREV</button>' : ''}
        ${currentStep < STEPS.length - 1
          ? '<button class="btn accent" id="tut-next">NEXT →</button>'
          : '<button class="btn accent" id="tut-done">START! ▶</button>'}
        <button class="btn danger" id="tut-skip">SKIP</button>
      </div>
    </div>`;

  // Insert animation canvas
  const container = document.getElementById('anim-container');
  if (container) container.appendChild(getAnimCanvas());

  // Bind buttons
  document.getElementById('tut-prev')?.addEventListener('click', () => { currentStep--; render(); });
  document.getElementById('tut-next')?.addEventListener('click', () => { currentStep++; render(); });
  document.getElementById('tut-done')?.addEventListener('click', closeTutorial);
  document.getElementById('tut-skip')?.addEventListener('click', closeTutorial);
}

function closeTutorial() {
  overlay.classList.remove('visible');
  currentStep = 0;
  if (onCloseCallback) onCloseCallback();
}

export function showTutorial(onClose) {
  onCloseCallback = onClose;
  currentStep = 0;
  animFrame = 0;
  overlay.classList.add('visible');
  render();
  drawAnimFrame();
}

export function hideTutorial() {
  overlay.classList.remove('visible');
}