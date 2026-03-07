# Project Context: GCHQ-Inspired Spycraft (2025 Christmas Challenge)

## Vision
To create a high-fidelity, immersive "Q-Branch" style terminal that brings the spirit of the GCHQ Christmas Challenge to life. The app should feel like a secure, elite intelligence tool, emphasizing cryptography, logic, and lateral thinking.

## Core Mandates
- **Architecture:** Purely client-side Next.js (Static Export).
- **State:** Managed via `GameStateContext` and persisted in `localStorage`.
- **Backend:** ZERO backend dependencies. All logic, puzzles, and "leaderboards" are simulated or local.
- **Security:** Use `window.crypto` for all randomization (no `Math.random`).
- **Data Portability:** "Export/Import Dossier" functionality for manual cross-device syncing.

## Aesthetic & UX (The "Super Modern" Look)
- **Theme:** Ultra-dark "Intelligence Agency" aesthetic.
- **Palette:** Deep blacks (`#000000`), rich navies/purples for depth, and vibrant neon accents (Emerald for success, Amber for warnings, Cyan/Violet for UI elements).
- **Interactions:** Heavy use of `motion/react` (Framer Motion) for "scanning" effects, terminal typing, and glassmorphism.
- **Responsiveness:** Must feel like a professional workstation on desktop and a secure field device on mobile.

## Puzzle Philosophy
Inspired by GCHQ 2025:
- **Cryptography:** Substitution, Transposition, Book ciphers.
- **Logic:** Map coloring, network nodes, sequence completion.
- **Lateral Thinking:** Visual patterns, metadata analysis.
- **Scalability:** Ability to support hundreds of puzzles across different "Themes" (e.g., Cold War, Cyber Ops, Signals Intelligence).
