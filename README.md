🚀 SPACE KA SCENE
A fast, juicy 2D arcade space-shooter built from scratch in vanilla JavaScript and HTML5 Canvas — no frameworks, no engines, just code.

Designed, coded, and shipped end-to-end inside a strict 2-hour build window.

✨ Features
1.🎮 Single-player & 2-player co-op modes.

2.👾 Three event challenges — Meteor Storm, Boss Rush, Pilot Training.

3.💥 Particle effects, shockwaves, screen shake, hit flash, score popups

4.⚡ Power-ups, escort mini-ships, and antigravity physics

5.🧠 Carrier (boss) ships with unique behavior

6.📊 Live HUD — score, combo, kills, accuracy

7.💾 Persistent high-scores and lifetime stats

8.🎓 Built-in tutorial and ESC pause overlay

9.👥 Friends list with custom name entry

10.🌌 Smooth fade transitions between every screen

11.🪶 Zero dependencies — pure HTML, CSS, and ES6 modules

12.🛠 Tech Stack

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
    
Procedure to run the game: 
After downloading and installing all the requistics and file. Go to the main HTML file "Index.html" Switch to "Open live server". The game will be on your screen.

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




📜 License
This project is licensed under the MIT License — see the LICENSE file for details.
