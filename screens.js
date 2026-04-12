/**
 * screens.js — All menu screens
 *
 * Each screen is a function that draws to the canvas and handles
 * mouse interaction. Persistent data is managed through save.js.
 *
 * Screens: Home, Mode Select, Friends, Rewards, Events, Scores
 */

import { ctx, WIDTH, HEIGHT } from './canvas.js';
import { drawButton, drawPanel, drawShipIcon, roundedRect, setGlobalTime } from './ui.js';
import { loadSave, addFriend, removeFriend, claimDailyReward, getRewardState } from './save.js';

// --- Reward definitions for each day ---
const REWARD_ITEMS = [
  "100 Credits", "Shield Boost", "200 Credits",
  "Double XP", "500 Credits", "Rare Skin", "1000 Credits"
];

// --- Friends screen state ---
let friendInput = "";
let friendMsg = "";
let friendMsgTimer = 0;
let isTypingFriend = false;

// Capture keyboard input for friend name entry
window.addEventListener("keydown", e => {
  if (!isTypingFriend) return;
  if (e.code === "Enter" && friendInput.trim()) {
    const success = addFriend(friendInput.trim());
    friendMsg = success ? `✓ Added ${friendInput.trim()}` : `✗ Already exists`;
    friendMsgTimer = 2;
    friendInput = "";
  } else if (e.code === "Backspace") {
    friendInput = friendInput.slice(0, -1);
  } else if (e.key.length === 1 && friendInput.length < 15) {
    friendInput += e.key;
  }
});

// ═══════════════════════════════════════════════════
//  HOME SCREEN
// ═══════════════════════════════════════════════════
export function drawHome(gt, mx, my, cl, goTo) {
  setGlobalTime(gt);

  // Animated rainbow title
  const title = "SPACE KA SCENE";
  ctx.font = "bold 46px 'Orbitron', monospace";
  ctx.textAlign = "center";
  const totalWidth = ctx.measureText(title).width;
  let cursorX = WIDTH / 2 - totalWidth / 2;

  for (let i = 0; i < title.length; i++) {
    const char = title[i];
    const charWidth = ctx.measureText(char).width;
    const yOffset = Math.sin(gt * 3 + i * 0.5) * 8;
    const hue = (gt * 40 + i * 22) % 360;

    ctx.fillStyle = `hsl(${hue},85%,72%)`;
    ctx.shadowColor = `hsl(${hue},90%,60%)`;
    ctx.shadowBlur = 25;
    ctx.fillText(char, cursorX + charWidth / 2, 110 + yOffset);
    cursorX += charWidth;
  }
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = "16px 'Inter', sans-serif";
  ctx.fillText("S P A C E   S H O O T E R", WIDTH / 2, 145);

  // Navigation buttons
  const bw = 190, bh = 46, gap = 12, startY = 185;
  if (drawButton(WIDTH / 2 - bw / 2, startY, bw, bh, "▶  PLAY", mx, my, cl, "#44cc66")) goTo('MODE');
  if (drawButton(WIDTH / 2 - bw / 2, startY + (bh + gap), bw, bh, "📖  TUTORIAL", mx, my, cl, "#44ddff")) goTo('TUTORIAL');
  if (drawButton(WIDTH / 2 - bw / 2, startY + 2 * (bh + gap), bw, bh, "👥  FRIENDS", mx, my, cl, "#4499ff")) goTo('FRIENDS');
  if (drawButton(WIDTH / 2 - bw / 2, startY + 3 * (bh + gap), bw, bh, "🎁  REWARDS", mx, my, cl, "#ffaa33")) goTo('REWARDS');
  if (drawButton(WIDTH / 2 - bw / 2, startY + 4 * (bh + gap), bw, bh, "🎮  EVENTS", mx, my, cl, "#ff5577")) goTo('EVENTS');
  if (drawButton(WIDTH / 2 - bw / 2, startY + 5 * (bh + gap), bw, bh, "🏆  SCORES", mx, my, cl, "#aa66ff")) goTo('SCORES');
}

// ═══════════════════════════════════════════════════
//  MODE SELECT
// ═══════════════════════════════════════════════════
export function drawMode(gt, mx, my, cl, goTo, setMode) {
  setGlobalTime(gt);
  drawPanel(WIDTH / 2 - 300, 40, 600, 460, "CHOOSE MODE");

  const cardW = 250, cardH = 340, cardY = 100;

  // Solo card
  const soloX = WIDTH / 2 - 270;
  const soloHover = mx >= soloX && mx <= soloX + cardW && my >= cardY && my <= cardY + cardH;
  ctx.fillStyle = soloHover ? 'rgba(68,153,255,0.15)' : 'rgba(255,255,255,0.04)';
  ctx.strokeStyle = soloHover ? '#4499ff' : 'rgba(255,255,255,0.1)';
  ctx.lineWidth = soloHover ? 2 : 1;
  roundedRect(soloX, cardY, cardW, cardH, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4499ff'; ctx.font = "bold 20px 'Orbitron', monospace"; ctx.textAlign = 'center';
  ctx.fillText("SOLO", soloX + cardW / 2, cardY + 40);
  drawShipIcon(soloX + cardW / 2, cardY + 140, '#4499ff', 2.5);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "13px 'Inter', sans-serif";
  ctx.fillText("WASD + Space + F", soloX + cardW / 2, cardY + 250);
  if (soloHover && cl) { setMode(1); goTo('GAME'); }

  // Co-op card
  const coopX = WIDTH / 2 + 20;
  const coopHover = mx >= coopX && mx <= coopX + cardW && my >= cardY && my <= cardY + cardH;
  ctx.fillStyle = coopHover ? 'rgba(51,221,102,0.15)' : 'rgba(255,255,255,0.04)';
  ctx.strokeStyle = coopHover ? '#33dd66' : 'rgba(255,255,255,0.1)';
  ctx.lineWidth = coopHover ? 2 : 1;
  roundedRect(coopX, cardY, cardW, cardH, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#33dd66'; ctx.font = "bold 20px 'Orbitron', monospace";
  ctx.fillText("CO-OP", coopX + cardW / 2, cardY + 40);
  drawShipIcon(coopX + cardW / 2 - 20, cardY + 140, '#4499ff', 2);
  drawShipIcon(coopX + cardW / 2 + 20, cardY + 140, '#33dd66', 2);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "13px 'Inter', sans-serif";
  ctx.fillText("2P Local · Shared KB", coopX + cardW / 2, cardY + 250);
  if (coopHover && cl) { setMode(2); goTo('GAME'); }

  if (drawButton(20, HEIGHT - 55, 100, 38, "← BACK", mx, my, cl, "#666")) goTo('HOME');
}

// ═══════════════════════════════════════════════════
//  FRIENDS — Add/remove friends, persisted
// ═══════════════════════════════════════════════════
export function drawFriends(gt, mx, my, cl, goTo, dt) {
  setGlobalTime(gt);
  isTypingFriend = true;
  const save = loadSave();
  drawPanel(WIDTH / 2 - 340, 20, 680, 500, "FRIENDS");

  // Add friend input box
  const inputX = WIDTH / 2 - 200, inputY = 60;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.strokeStyle = 'rgba(100,160,255,0.3)'; ctx.lineWidth = 1;
  roundedRect(inputX, inputY, 300, 32, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = friendInput ? '#fff' : 'rgba(255,255,255,0.3)';
  ctx.font = "14px 'Inter', sans-serif"; ctx.textAlign = 'left';
  ctx.fillText(friendInput || "Type name + Enter to add...", inputX + 10, inputY + 21);
  // Blinking cursor
  if (Math.sin(gt * 4) > 0) {
    const curW = ctx.measureText(friendInput).width;
    ctx.fillStyle = '#4499ff';
    ctx.fillRect(inputX + 10 + curW + 2, inputY + 8, 1.5, 16);
  }

  // Add button
  if (drawButton(inputX + 310, inputY - 3, 80, 36, "+ ADD", mx, my, cl, "#44cc66")) {
    if (friendInput.trim()) {
      const success = addFriend(friendInput.trim());
      friendMsg = success ? `✓ Added ${friendInput.trim()}` : `✗ Already exists`;
      friendMsgTimer = 2;
      friendInput = "";
    }
  }

  // Status message
  if (friendMsgTimer > 0) {
    friendMsgTimer -= dt;
    ctx.fillStyle = friendMsg.startsWith("✓") ? '#44dd66' : '#ff4466';
    ctx.font = "12px 'Inter', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText(friendMsg, WIDTH / 2, inputY + 52);
  }

  // Friend list
  const listX = WIDTH / 2 - 310, listStartY = inputY + 65;
  const friends = save.friends;

  if (friends.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = "14px 'Inter', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText("No friends yet. Add one above!", WIDTH / 2, listStartY + 60);
  }

  for (let i = 0; i < friends.length && i < 6; i++) {
    const f = friends[i];
    const fy = listStartY + i * 62;

    // Card background
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    roundedRect(listX, fy, 560, 52, 8); ctx.fill(); ctx.stroke();

    // Avatar circle
    ctx.fillStyle = f.online ? '#4499ff' : '#555';
    ctx.beginPath(); ctx.arc(listX + 28, fy + 26, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(f.name.slice(0, 2).toUpperCase(), listX + 28, fy + 26);
    ctx.textBaseline = 'alphabetic';

    // Name and status
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff'; ctx.font = "bold 14px 'Inter', sans-serif";
    ctx.fillText(f.name, listX + 54, fy + 22);
    ctx.fillStyle = f.online ? '#44dd66' : '#888'; ctx.font = "11px 'Inter', sans-serif";
    ctx.fillText(f.online ? "● Online" : "○ Offline", listX + 54, fy + 40);

    // Score
    ctx.textAlign = 'right'; ctx.fillStyle = '#ffcc33'; ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText("🏆 " + f.score, listX + 480, fy + 30);

    // Remove button
    if (drawButton(listX + 498, fy + 10, 50, 30, "✕", mx, my, cl, "#ff4466")) {
      removeFriend(i);
    }
  }

  if (drawButton(20, HEIGHT - 55, 100, 38, "← BACK", mx, my, cl, "#666")) {
    isTypingFriend = false;
    goTo('HOME');
  }
}

// ═══════════════════════════════════════════════════
//  REWARDS — Claimable daily rewards with streak
// ═══════════════════════════════════════════════════
export function drawRewards(gt, mx, my, cl, goTo) {
  setGlobalTime(gt);
  const rewardState = getRewardState();
  drawPanel(WIDTH / 2 - 350, 25, 700, 500, "REWARDS");

  // Section header
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = "bold 14px 'Orbitron', monospace"; ctx.textAlign = 'left';
  ctx.fillText("DAILY LOGIN", WIDTH / 2 - 310, 78);

  // Streak indicator
  ctx.fillStyle = '#ffcc33'; ctx.textAlign = 'right';
  ctx.fillText(`🔥 Streak: ${rewardState.streak} days`, WIDTH / 2 + 310, 78);

  // Daily reward cards
  const cardW = 85, startX = WIDTH / 2 - 310;
  for (let i = 0; i < 7; i++) {
    const dayNum = i + 1;
    const dx = startX + i * 93, dy = 95;
    const isClaimed = rewardState.claimedDays.includes(dayNum);
    const isClaimable = !rewardState.claimedToday && dayNum === rewardState.streak + 1;

    // Card style based on state
    if (isClaimed) {
      ctx.fillStyle = 'rgba(68,221,102,0.12)';
      ctx.strokeStyle = '#44dd66';
    } else if (isClaimable) {
      ctx.fillStyle = 'rgba(255,170,51,0.18)';
      ctx.strokeStyle = '#ffaa33';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    }

    ctx.lineWidth = isClaimable ? 2 : 1;
    roundedRect(dx, dy, cardW, 85, 8); ctx.fill(); ctx.stroke();

    // Day label
    ctx.fillStyle = isClaimed ? '#44dd66' : '#fff';
    ctx.font = "bold 12px 'Inter', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText("Day " + dayNum, dx + cardW / 2, dy + 18);

    // Reward text
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = "10px 'Inter', sans-serif";
    ctx.fillText(REWARD_ITEMS[i], dx + cardW / 2, dy + 38);

    // Status icon or claim button
    if (isClaimed) {
      ctx.fillStyle = '#44dd66'; ctx.font = "22px sans-serif";
      ctx.fillText("✓", dx + cardW / 2, dy + 70);
    } else if (isClaimable) {
      // Pulsing CLAIM button
      const pulse = 0.8 + 0.2 * Math.sin(gt * 4);
      ctx.fillStyle = `rgba(255,170,51,${pulse})`;
      ctx.font = "bold 11px 'Orbitron', monospace";
      ctx.fillText("CLAIM", dx + cardW / 2, dy + 68);

      // Click to claim
      if (cl && mx >= dx && mx <= dx + cardW && my >= dy && my <= dy + 85) {
        claimDailyReward();
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = "18px sans-serif";
      ctx.fillText("🔒", dx + cardW / 2, dy + 70);
    }
  }

  // Lifetime stats section
  const save = loadSave();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = "bold 14px 'Orbitron', monospace"; ctx.textAlign = 'left';
  ctx.fillText("LIFETIME STATS", WIDTH / 2 - 310, 210);

  const statsData = [
    { icon: "💀", label: "Total Kills", value: save.lifetime.totalKills },
    { icon: "🎮", label: "Games Played", value: save.lifetime.totalGames },
    { icon: "⭐", label: "Best Score", value: save.lifetime.bestScore },
    { icon: "🔥", label: "Best Combo", value: "x" + save.lifetime.bestCombo }
  ];

  for (let i = 0; i < 4; i++) {
    const s = statsData[i];
    const sx = startX + i * 165, sy = 228;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    roundedRect(sx, sy, 155, 90, 8); ctx.fill(); ctx.stroke();

    ctx.font = "24px sans-serif"; ctx.textAlign = 'center';
    ctx.fillText(s.icon, sx + 77, sy + 32);
    ctx.fillStyle = '#fff'; ctx.font = "bold 18px 'Orbitron', monospace";
    ctx.fillText(String(s.value), sx + 77, sy + 58);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "11px 'Inter', sans-serif";
    ctx.fillText(s.label, sx + 77, sy + 78);
  }

  if (drawButton(20, HEIGHT - 55, 100, 38, "← BACK", mx, my, cl, "#666")) goTo('HOME');
}

// ═══════════════════════════════════════════════════
//  EVENTS — Interactive challenges with live progress
// ═══════════════════════════════════════════════════
export function drawEvents(gt, mx, my, cl, goTo) {
  setGlobalTime(gt);
  const save = loadSave();
  drawPanel(WIDTH / 2 - 320, 30, 640, 480, "EVENTS");

  const eventDefs = [
    { key: "meteor", name: "Meteor Storm", desc: "Survive and kill 200 enemies total", color: "#ff6644", icon: "☄️" },
    { key: "boss", name: "Boss Rush", desc: "Destroy 20 carrier ships", color: "#bb55ff", icon: "👾" },
    { key: "games", name: "Pilot Training", desc: "Complete 10 game sessions", color: "#44ddff", icon: "🚀" }
  ];

  for (let i = 0; i < eventDefs.length; i++) {
    const def = eventDefs[i];
    const evt = save.events[def.key];
    const progress = Math.min(evt.kills !== undefined ? evt.kills / evt.goal : evt.count / evt.goal, 1);
    const current = evt.kills !== undefined ? evt.kills : evt.count;
    const isComplete = progress >= 1;

    const ey = 90 + i * 130, ex = WIDTH / 2 - 290;

    // Card
    ctx.fillStyle = isComplete ? 'rgba(68,221,102,0.08)' : 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = isComplete ? '#44dd66' : def.color + '44'; ctx.lineWidth = 1;
    roundedRect(ex, ey, 580, 110, 10); ctx.fill(); ctx.stroke();

    // Color accent bar
    ctx.fillStyle = def.color;
    roundedRect(ex, ey, 5, 110, 3); ctx.fill();

    // Icon + Title
    ctx.font = "24px sans-serif"; ctx.textAlign = 'left';
    ctx.fillText(def.icon, ex + 18, ey + 34);
    ctx.fillStyle = '#fff'; ctx.font = "bold 18px 'Orbitron', monospace";
    ctx.fillText(def.name, ex + 52, ey + 30);

    // Description
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "13px 'Inter', sans-serif";
    ctx.fillText(def.desc, ex + 52, ey + 52);

    // Progress counter
    ctx.textAlign = 'right';
    ctx.fillStyle = isComplete ? '#44dd66' : def.color;
    ctx.font = "bold 14px 'Orbitron', monospace";
    ctx.fillText(isComplete ? "✓ COMPLETE" : `${current} / ${evt.goal}`, ex + 420, ey + 30);

    // Progress bar (shorter to make room for button)
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundedRect(ex + 22, ey + 72, 400, 18, 9); ctx.fill();
    ctx.fillStyle = isComplete ? '#44dd66' : def.color;
    roundedRect(ex + 22, ey + 72, 400 * progress, 18, 9); ctx.fill();

    // Percentage text on bar
    ctx.fillStyle = '#fff'; ctx.font = "bold 11px 'Inter', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText(Math.floor(progress * 100) + "%", ex + 222, ey + 85);

    // PLAY button
    if (!isComplete) {
      if (drawButton(ex + 450, ey + 60, 110, 36, "▶ PLAY", mx, my, cl, def.color)) {
        // Assume default Solo play for events if clicked
        goTo('GAME', def.key);
      }
    } else {
      ctx.fillStyle = '#44dd66'; ctx.font = "bold 14px 'Orbitron', monospace"; ctx.textAlign = 'center';
      ctx.fillText("DONE", ex + 505, ey + 82);
    }
  }

  // Play prompt
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = "12px 'Inter', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText("Play games to progress events! Click PLAY above to jump right in.", WIDTH / 2, HEIGHT - 70);

  if (drawButton(20, HEIGHT - 55, 100, 38, "← BACK", mx, my, cl, "#666")) goTo('HOME');
}

// ═══════════════════════════════════════════════════
//  SCORES — Animated leaderboard
// ═══════════════════════════════════════════════════
export function drawScores(gt, mx, my, cl, goTo) {
  setGlobalTime(gt);
  const save = loadSave();
  drawPanel(WIDTH / 2 - 300, 25, 600, 490, "LEADERBOARD");

  // Best score highlight
  if (save.lifetime.bestScore > 0) {
    ctx.fillStyle = '#ffcc33'; ctx.font = "bold 14px 'Orbitron', monospace"; ctx.textAlign = 'center';
    ctx.fillText(`⭐ Personal Best: ${save.lifetime.bestScore.toLocaleString()}`, WIDTH / 2, 72);
  }

  // Column headers
  const tableX = WIDTH / 2 - 270, headerY = 92;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = "bold 13px 'Orbitron', monospace"; ctx.textAlign = 'left';
  ctx.fillText("RANK", tableX, headerY);
  ctx.fillText("SCORE", tableX + 110, headerY);
  ctx.fillText("DATE", tableX + 290, headerY);
  ctx.fillText("PERFORMANCE", tableX + 410, headerY);

  // Divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(tableX, headerY + 12); ctx.lineTo(tableX + 540, headerY + 12); ctx.stroke();

  const medals = ['🥇', '🥈', '🥉'];

  for (let i = 0; i < 10; i++) {
    const rowY = headerY + 28 + i * 36;

    // Animated row entrance (stagger)
    const animDelay = Math.max(0, 1 - (gt * 3 - i * 0.15));
    if (animDelay > 0) continue;

    const rowOffset = animDelay * 20;

    // Alternating row background
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      roundedRect(tableX - 10, rowY - 12 + rowOffset, 560, 32, 6); ctx.fill();
    }

    if (i < save.scores.length) {
      const entry = save.scores[i];

      // Rank
      ctx.fillStyle = '#fff'; ctx.font = "bold 16px 'Inter', sans-serif"; ctx.textAlign = 'left';
      ctx.fillText(i < 3 ? medals[i] : `#${i + 1}`, tableX, rowY + 6 + rowOffset);

      // Score
      ctx.fillStyle = i < 3 ? '#ffcc33' : '#44ddff';
      ctx.font = `bold ${i < 3 ? 18 : 16}px 'Orbitron', monospace`;
      ctx.fillText(entry.score.toLocaleString(), tableX + 110, rowY + 6 + rowOffset);

      // Date
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = "14px 'Inter', sans-serif";
      ctx.fillText(entry.date, tableX + 290, rowY + 6 + rowOffset);

      // Performance Bar
      const maxScore = save.scores[0]?.score || 1;
      const relWidth = (entry.score / maxScore) * 120;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      roundedRect(tableX + 410, rowY - 4 + rowOffset, 120, 14, 4); ctx.fill();
      
      // Gradient for bar
      const barGrad = ctx.createLinearGradient(tableX + 410, 0, tableX + 410 + relWidth, 0);
      barGrad.addColorStop(0, i < 3 ? '#ffaa33' : '#4499ff');
      barGrad.addColorStop(1, i < 3 ? '#ffcc33' : '#44ddff');
      ctx.fillStyle = barGrad;
      roundedRect(tableX + 410, rowY - 4 + rowOffset, relWidth, 14, 4); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = "14px 'Inter', sans-serif"; ctx.textAlign = 'left';
      ctx.fillText(`#${i + 1}   — empty —`, tableX, rowY + 6 + rowOffset);
    }
  }

  // Clear button
  if (save.scores.length > 0) {
    if (drawButton(WIDTH / 2 + 135, HEIGHT - 55, 120, 38, "🗑 CLEAR", mx, my, cl, "#ff4466")) {
      const s = loadSave();
      s.scores = [];
      localStorage.setItem('sks_gamedata', JSON.stringify(s));
    }
  }

  if (drawButton(20, HEIGHT - 55, 100, 38, "← BACK", mx, my, cl, "#666")) goTo('HOME');
}