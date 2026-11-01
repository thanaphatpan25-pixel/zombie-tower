# ZOMBIE TOWER: LAST ASCENT

A 2D zombie-survival platformer prototype with a vertical tower-climbing challenge. Climb higher, fight the infected, and stay ahead of the rising horde.

> **Project status:** Playable prototype in active development. The main climbing and combat loop is implemented; missions, leaderboard, persistent player records, and production deployment are planned work.

## Current prototype features

- Keyboard and mobile-touch movement controls.
- Jumping and platform collision.
- Vertical tower with multiple climbing platforms.
- Camera follow while the player climbs.
- Zombies that pursue the player.
- A rising horde hazard.
- Player health, score, and floor progress.
- Melee combat with hit detection and zombie damage.
- Game Over and restart flow.

## Controls

| Action | Keyboard | Mobile |
|---|---|---|
| Move left | `←` | Left control |
| Move right | `→` | Right control |
| Jump | `Space` or `↑` | Jump control |
| Attack | `J` or `X` | Attack control |

The exact control labels may evolve as the game UI is refined.

## Tech stack

- [Next.js](https://nextjs.org/) App Router
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Phaser](https://phaser.io/) for the 2D game
- Tailwind CSS for the web UI foundation

## Repository structure

```text
zombie-tower/
├── README.md
└── web-game/
    ├── app/
    │   ├── game/
    │   │   └── page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── src/
    │   └── components/
    │       └── ZombieGame.tsx
    ├── public/
    ├── package.json
    ├── package-lock.json
    ├── next.config.ts
    └── tsconfig.json
```

The App Router lives in `web-game/app/`. Shared React components live in `web-game/src/components/`.

## Run locally

### Requirements

- Node.js and npm
- Git

### Install and start

```bash
git clone https://github.com/thanaphatpan25-pixel/zombie-tower.git
cd zombie-tower/web-game
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the main menu, then choose **Play Game** or open [http://localhost:3000/game/](http://localhost:3000/game/) directly.

## Quality checks

Run these commands from the `web-game/` directory:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

All checks should pass before committing a change.

## Development roadmap

- [x] Playable movement and jump prototype
- [x] Vertical tower and camera follow
- [x] Basic zombie pursuit and rising horde hazard
- [x] Melee combat prototype
- [x] Game Over and restart flow
- [x] Main menu foundation
- [ ] Character and zombie pixel-art sprites and animations
- [ ] Expanded zombie behaviours and combat feedback
- [ ] Mission mode and educational quiz gates
- [ ] Admin tools for managing quiz questions
- [ ] Player results and score history using a backend service
- [ ] Static deployment to GitHub Pages

## Educational direction

The planned mission mode will use quiz gates to reinforce lesson content. Quiz content and learning objectives will be managed separately from the core game so they can be updated without rebuilding the game logic.

## Project repository

[thanaphatpan25-pixel/zombie-tower](https://github.com/thanaphatpan25-pixel/zombie-tower)
