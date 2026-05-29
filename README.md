<div align="center">

<img src="https://img.shields.io/badge/Typo-Technical%20Typing%20Game-6c63ff?style=for-the-badge&logo=keyboard&logoColor=white" alt="Typo Banner"/>

# ⌨️ TYPO — Master Technical Typing

**A premium, gamified typing trainer built for developers, DevOps engineers, and terminal warriors.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-typo--technical--typing--3000.web.app-6c63ff?style=for-the-badge)](https://typo-technical-typing-3000.web.app)
[![GitHub](https://img.shields.io/badge/GitHub-sarang--cmd%2Ftypo-181717?style=for-the-badge&logo=github)](https://github.com/sarang-cmd/typo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Firebase](https://img.shields.io/badge/Deployed%20on-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)

---

*Type faster. Fail smarter. Level up.*

</div>

---

## 🎮 What is Typo?

**Typo** is a gamified technical typing speed game that goes far beyond "just type what you see." It uses **progressive difficulty**, **spaced repetition**, **real-time analytics**, and **immersive feedback** to build genuine muscle memory for the characters and patterns developers use every day — brackets, pipes, semicolons, terminal commands, and more.

Whether you're a beginner who just learned what a shell is, or a senior engineer who wants to shave milliseconds off every keystroke, Typo adapts to you.

---

## ✨ Features

### 🛤️ Learning Pathways
Choose your track and climb level by level:

| Track | Focus |
|-------|-------|
| **🖥️ Terminal & Git** | Shell commands, Git workflows, bash scripting |
| **🐍 Python** | Python syntax, indentation-heavy code, f-strings |
| **🌐 JavaScript** | ES6+, async/await, arrow functions, JSX |
| **📦 Misc / General** | Broader dev vocabulary and mixed patterns |

Each track starts with **plain English descriptions** of the commands, then transitions into real code snippets — rewarding you with a seamless ramp-up that keeps you in flow state.

---

### 📈 Progressive Difficulty System
- **Level 1–3:** Short, simple sentences describing terminal concepts
- **Level 4–6:** Single-line commands with flags and arguments
- **Level 7–10:** Multi-line scripts, complex pipes, and chained commands
- Text gets progressively **longer and more complex** as you advance, without ever feeling like a cliff

---

### 🧠 Mistake Vault (Spaced Repetition Engine)
Powered by a **Leitner-style spaced repetition algorithm:**
- Every character you mistype is tracked and stored
- Mistakes are **weighted and surfaced more frequently** in future sessions
- As you correctly type a character, its weight decreases
- Your personal `MistakeVault` is persisted in `localStorage` — it survives refreshes
- View your most common errors in real time during the game

---

### 🏆 XP & League System
- Earn **XP** on every completed lesson based on WPM, accuracy, and streak
- Climb through leagues: **Bronze → Silver → Gold → Platinum → Diamond**
- **Weekly Leagues** reset each Monday — compete globally for top placement
- Your rank and XP are saved locally and displayed in the HUD

---

### 📊 Real-Time WPM Chart
- A live **canvas-based line graph** updates every 2 seconds
- Tracks your WPM trend throughout the current session
- Color-coded zones for slow / moderate / fast / elite typing speeds

---

### ⌨️ Virtual Keyboard Heatmap
- A fully rendered on-screen keyboard visualizes which keys you're hitting
- Keys **light up in real time** when pressed
- Color intensity reflects **mistake frequency** — red = most common error keys
- Helps identify weak fingers and hand positioning issues

---

### 🦉 Cyber Owl Mascot
Meet **Cygwin**, your in-game typing coach:
- Lives in the bottom-right corner of the arena
- Reacts dynamically to your performance (cheering, worried, idle)
- Gives you real-time pep talks and contextual tips
- Disappears gracefully when not needed

---

### 🎓 New Player Tutorial
First time? Typo has you covered:
- A **multi-step tutorial dialog** greets new players on first launch
- Explains the core loop, streak system, and how to navigate tracks
- Skippable, but rewarded — completing it unlocks a bonus XP package
- Never shown again after completion (stored in `localStorage`)

---

### 🎉 Reward System
Every lesson completion triggers:
- An animated **XP burst** overlay with personalized messages
- **Confetti effects** for milestone levels and league promotions
- Encouraging messages that adapt to your performance (great WPM, perfect accuracy, streak maintained)
- A clear **"Next Lesson →"** prompt so you always know what to do next

---

### 🔊 Web Audio Keystroke Synthesizer
- No sound files needed — all audio is generated via the **Web Audio API**
- Every keypress produces a satisfying click sound
- Error keystrokes produce a distinct, non-jarring audio cue
- Volume is adjustable and can be muted from settings

---

### ⚙️ Settings & Customization
- Toggle **sound effects** on/off
- Toggle **auto-advance** to next lesson
- Switch between **keyboard themes**
- All settings persist via `localStorage`

---

### 🕵️ Secret Developer Console
> **For power users and contributors only.**

Activate the hidden dev menu with:

```
Ctrl + Shift + D
```

The dev console opens an overlay with:
- **Force-complete current level** — skip to the results screen instantly
- **Unlock all levels** — bypass the progression gate
- **Reset all progress** — wipe XP, league, unlocked levels, mistake vault
- **Add XP manually** — inject XP to test league promotion
- **Dump state to console** — log the full game state JSON
- **Toggle god mode** — no accuracy penalty, infinite streak

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v16+ (for local dev server)
- A modern browser (Chrome, Firefox, Edge, Safari)

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/sarang-cmd/typo.git
cd typo

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

> The app is a **zero-dependency static site**. No build step required. `npm run dev` just spins up a local HTTP server.

---

## 🌐 Live Demo

**👉 [https://typo-technical-typing-3000.web.app](https://typo-technical-typing-3000.web.app)**

Deployed on **Firebase Hosting** — globally distributed, HTTPS, zero-config CDN.

---

## 🗂️ Project Structure

```
typo/
├── index.html       # Main app shell — all UI markup and modals
├── app.js           # GameEngine, MistakeVault, SoundSynthesizer, WpmChart
├── snippets.js      # All typing content across tracks and difficulty levels
├── styles.css       # All styles — dark mode, animations, mascot, HUD
├── package.json     # Scripts and metadata
├── firebase.json    # Firebase Hosting config
└── .firebaserc      # Firebase project binding
```

### Key Classes in `app.js`

| Class | Responsibility |
|-------|---------------|
| `GameEngine` | Orchestrates the entire game loop, input handling, level progression |
| `MistakeVault` | Tracks per-character error history, implements spaced repetition weighting |
| `SoundSynthesizer` | Generates all audio via Web Audio API (no sound files) |
| `WpmChart` | Renders the live WPM trend line on an HTML5 `<canvas>` |

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | Vanilla HTML5 |
| Logic | Vanilla JavaScript (ES6+, no frameworks) |
| Styling | Vanilla CSS (custom properties, animations, glassmorphism) |
| Audio | Web Audio API |
| Graphics | HTML5 Canvas |
| Storage | `localStorage` |
| Hosting | Firebase Hosting |
| Dev Server | `http-server` (via `npx`) |

**Zero runtime dependencies.** No React, no Webpack, no TypeScript. Just fast, raw web tech.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** this repository
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Add your changes** — new snippet tracks, features, or bug fixes
4. **Open a PR** with a clear description

### Adding New Snippet Tracks

Edit `snippets.js` and follow the existing structure:

```js
{
  id: 'my-track',
  name: 'My Track',
  levels: [
    { id: 1, text: "Short, easy intro text.", difficulty: 1 },
    { id: 2, text: "A slightly longer sentence.", difficulty: 2 },
    // ... up to 10 levels, increasing complexity
  ]
}
```

---

## 📄 License

MIT © [Sarang](https://github.com/sarang-cmd)

---

<div align="center">

**Built with ❤️ for developers who type for a living.**

[🚀 Play Now](https://typo-technical-typing-3000.web.app) · [🐛 Report a Bug](https://github.com/sarang-cmd/typo/issues) · [💡 Request a Feature](https://github.com/sarang-cmd/typo/issues)

</div>
