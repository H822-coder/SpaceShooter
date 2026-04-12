/**
 * save.js — Persistent game data (localStorage)
 * 
 * Manages friends list, daily rewards, event progress,
 * leaderboard scores, and lifetime stats.
 */

const SAVE_KEY = 'sks_gamedata';

/** Default save structure for first-time players */
const DEFAULT_SAVE = {
  friends: [
    { name: "StarPilot", score: 4280, online: true },
    { name: "NovaCrush", score: 3150, online: true },
    { name: "VoidWalker", score: 2890, online: false }
  ],
  rewards: {
    lastClaimDate: null,
    streak: 0,
    claimedDays: []
  },
  events: {
    meteor: { kills: 0, goal: 200 },
    boss:   { kills: 0, goal: 20 },
    games:  { count: 0, goal: 10 }
  },
  scores: [],
  lifetime: {
    totalKills: 0,
    totalGames: 0,
    bestScore: 0,
    totalTime: 0,
    bestCombo: 0
  }
};

/** Load saved data, merging with defaults for missing fields */
export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return structuredClone(DEFAULT_SAVE);
    const saved = JSON.parse(raw);
    // Merge with defaults to handle schema changes
    return { ...structuredClone(DEFAULT_SAVE), ...saved };
  } catch {
    return structuredClone(DEFAULT_SAVE);
  }
}

/** Write save data to localStorage */
export function writeSave(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

/** Add a score to the leaderboard (keeps top 10) */
export function addScore(score) {
  const save = loadSave();
  save.scores.push({ score, date: new Date().toLocaleDateString() });
  save.scores.sort((a, b) => b.score - a.score);
  save.scores = save.scores.slice(0, 10);
  if (score > save.lifetime.bestScore) save.lifetime.bestScore = score;
  save.lifetime.totalGames++;
  writeSave(save);
}

/** Update lifetime stats after a game session */
export function updateLifetimeStats(kills, time, bestCombo, bossKills = 0) {
  const save = loadSave();
  save.lifetime.totalKills += kills;
  save.lifetime.totalTime += time;
  if (bestCombo > save.lifetime.bestCombo) save.lifetime.bestCombo = bestCombo;
  // Update event progress
  save.events.meteor.kills += kills;
  save.events.boss.kills += bossKills;
  save.events.games.count++;
  writeSave(save);
}

/** Add a friend by name */
export function addFriend(name) {
  const save = loadSave();
  // Prevent duplicates
  if (save.friends.some(f => f.name.toLowerCase() === name.toLowerCase())) return false;
  save.friends.push({ name, score: 0, online: Math.random() > 0.5 });
  writeSave(save);
  return true;
}

/** Remove a friend by index */
export function removeFriend(index) {
  const save = loadSave();
  if (index >= 0 && index < save.friends.length) {
    save.friends.splice(index, 1);
    writeSave(save);
  }
}

/** Claim today's daily reward. Returns day number claimed, or 0 if already claimed. */
export function claimDailyReward() {
  const save = loadSave();
  const today = new Date().toDateString();

  if (save.rewards.lastClaimDate === today) return 0; // Already claimed

  // Check if streak continues (claimed yesterday)
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (save.rewards.lastClaimDate === yesterday) {
    save.rewards.streak++;
  } else {
    save.rewards.streak = 1; // Reset streak
    save.rewards.claimedDays = [];
  }

  save.rewards.claimedDays.push(save.rewards.streak);
  save.rewards.lastClaimDate = today;
  writeSave(save);
  return save.rewards.streak;
}

/** Get current reward state */
export function getRewardState() {
  const save = loadSave();
  const today = new Date().toDateString();
  const claimedToday = save.rewards.lastClaimDate === today;
  return {
    streak: save.rewards.streak,
    claimedDays: save.rewards.claimedDays,
    claimedToday,
    nextDay: claimedToday ? save.rewards.streak + 1 : save.rewards.streak + 1
  };
}