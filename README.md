🚀 SPACE KA SCENE
A fast, juicy 2D arcade space-shooter built from scratch in vanilla JavaScript and HTML5 Canvas — no frameworks, no engines, just code.

🏆 1st Place Winner — Build-a-Game Challenge, INNOVATEX 4.0 International Tech Fest, Presidency University, Bangalore (April 2026).

Designed, coded, and shipped end-to-end inside a strict 2-hour build window.

✨ Features
🎮 Single-player & 2-player co-op modes
👾 Three event challenges — Meteor Storm, Boss Rush, Pilot Training
💥 Particle effects, shockwaves, screen shake, hit flash, score popups
⚡ Power-ups, escort mini-ships, and antigravity physics
🧠 Carrier (boss) ships with unique behavior
📊 Live HUD — score, combo, kills, accuracy
💾 Persistent high-scores and lifetime stats
🎓 Built-in tutorial and ESC pause overlay
👥 Friends list with custom name entry
🌌 Smooth fade transitions between every screen
🪶 Zero dependencies — pure HTML, CSS, and ES6 modules
🛠 Tech Stack
HTML5 Canvas for rendering
Vanilla JavaScript (ES6 modules) — no frameworks
CSS3 for the page shell
~1,800 lines across 10 cleanly separated modules
📁 Project Structure
.
├── index.html
├── style.css
└── src/
    ├── main.js         # Entry point, game loop, screen state machine
    ├── canvas.js       # Canvas setup, input, math helpers
    ├── background.js   # Animated starfield background
    ├── particles.js    # Explosions, shockwaves, popups
    ├── ui.js           # Buttons, panels, shared UI helpers
    ├── screens.js      # Home, Mode, Friends, Rewards, Events, Scores
    ├── tutorial.js     # In-game tutorial overlay
    ├── pause.js        # ESC pause overlay
    ├── save.js         # Persistent high-scores & lifetime stats
    └── game.js         # Core gameplay: players, enemies, lasers, physics
    
▶️ Running Locally
Because the game uses ES6 import modules, browsers won't load it from file://. You need a tiny local server. Pick whichever you like:

Python (already installed on most systems):

cd Build-A-Game-Challenge-INNOVATEX-4-Presidency-University
python -m http.server 8000
Then open http://localhost:8000.

Node:

npx serve
VS Code: Install the Live Server extension, right-click index.html → "Open with Live Server".

🎮 Controls
Player 1
Action	Key
Move	W A S D
Shoot	Space
Pulse	Shift
Player 2 (co-op mode)
Action	Key
Move	Arrow Keys
Shoot	Enter
Pulse	Right Shift
Global	Key
Pause	ESC
👥 Team
Built by 4 developers in 2 hours at INNOVATEX 4.0:

Member	GitHub
Shido (Voiid)	@official-imvoiid
Saim Tabbani	@Saimtabbani
Rifah Alam	@rifahalam123
Harsh Pillai	@H822-coder
🏆 Achievements
🥇 1st Place — Build-a-Game Challenge, INNOVATEX 4.0 (April 2026)
🎯 Delivered a fully playable, autonomous prototype within the 2-hour limit
🏗 Modular architecture with persistent stats and multiple game modes
📜 License
This project is licensed under the MIT License — see the LICENSE file for details.
