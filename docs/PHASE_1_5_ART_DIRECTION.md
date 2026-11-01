# ZOMBIE TOWER: LAST ASCENT
## Phase 1.5 — Art Direction & Animation Production Specification

**Status:** Draft baseline for Phase 1.5  
**Engine:** Phaser 4.x + Next.js + TypeScript  
**Purpose:** Lock a consistent pixel-art scale, sprite dimensions, palette, animation rules, collision approach, and gameplay balance before producing production assets.

---

## 1. Source principles adopted

This specification applies the project's `pixel-art-game-principles.md`:

1. Use one tile size and one internal resolution as shared measurement standards.
2. Define entity and object dimensions in tile units, not by arbitrary pixel sizing.
3. Use integer scaling and nearest-neighbor rendering for pixel art.
4. Keep player, enemy, obstacle, item, effects, and UI pixel density consistent; avoid mixed pixels (mixels).
5. Keep each animation's frame canvas and pivot identical to prevent sprite jitter.
6. Make the player, enemies, collidable objects, and pickups visually distinct.
7. Keep collision boxes slightly more forgiving than the visible sprite, and verify them with debug drawing.
8. Derive platform gaps from measured jump height/range and playtest the result.
9. Use a restrained shared palette, consistent outline, and one light direction.
10. Rebalance stats through playtesting rather than treating suggested values as immutable rules.

## 2. Locked project-wide pixel standard

| Setting | Phase 1.5 baseline | Reason |
|---|---:|---|
| Tile size | **16 × 16 px** | Matches the source guide's recommended starting point for platformers and educational games. |
| Internal resolution | **480 × 270 px** | Matches the current game's 16:9 presentation while providing more detail than 320 × 180. |
| Current desktop presentation target | **960 × 540 px (2×)** | Integer scale from the selected internal resolution. |
| Scaling | Integer multiples only; letterbox/crop when needed | Avoid uneven pixel widths. |
| Texture filtering | Nearest-neighbor / pixel-art mode | Keep pixel edges crisp. |
| Pixel positioning | Round rendered positions to whole pixels | Reduce sub-pixel shimmer. |
| Tile grid | 16 px on both axes | All dimensions and level measurements refer to this grid. |

**Implementation note:** The current Phaser game is configured at 960 × 540. Converting it to 480 × 270 is a coordinated technical task: convert world coordinates, physics values, platform geometry, HUD positions, and touch controls by the same scale policy. Do not change only the Phaser canvas dimensions. Keep the game playable during the conversion and test desktop plus mobile landscape. On mobile, use integer scaling and letterboxing; do not stretch the pixel-art canvas by an arbitrary fractional factor.

## 3. Entity dimensions

### Hero

- Frame canvas: **16 × 32 px** (1 tile wide × 2 tiles high).
- Visible silhouette: target 14 px or less in width, leaving a small transparent margin; feet align to the bottom row.
- Pivot/origin: bottom-center, consistent across every frame.
- Physics hitbox starting point: **12 × 24 px**, centered horizontally and aligned near the feet. Tune by playtest; it must remain smaller than the visible sprite.
- Facing: draw facing right; use horizontal flip for left only if the asymmetric details remain visually acceptable.

### Zombie archetypes

| Archetype | Frame canvas | Role and readability |
|---|---:|---|
| Walker | 16 × 32 px | Standard threat; same tile-height scale as Hero, but hunched silhouette and infected palette. |
| Runner | 16 × 32 px | Faster, forward-leaning silhouette; distinguish through posture and animation rather than arbitrary enlargement. |
| Climber | 32 × 32 px | Heavier/higher-threat enemy; visibly larger (2 × 2 tiles). Give it a wider hitbox that is still slightly smaller than its artwork. |

Each archetype may have its own sheet, but every frame within an individual animation must use the same canvas size and pivot. Do not resize one enemy's frames to fit another sheet.

### World objects (starting rules)

- Small obstacle: 16 × 16 px.
- Medium obstacle: 16 × 32 px.
- Door/gate: 16–32 px wide × 32 px high.
- Pickup: 8–16 px, with strong contrast and a subtle pixel animation.
- Projectile (if a ranged weapon is introduced later): 4–8 px.
- Main corridor width: at least 32 px (2 tiles), unless deliberately designed as a special narrow passage.

## 4. Hero sprite sheet contract

Production sheet must be a **transparent PNG with no labels, panel borders, background, shadows outside the sprite, or decorative text**.

- Cell size: **16 × 32 px**.
- Layout: **8 columns × 8 rows**.
- Total sheet size: **128 × 256 px**.
- All cells have identical dimensions and bottom-center pivot.
- Unused cells remain fully transparent.
- Keep the sprite within its cell; do not let effects spill into neighboring cells.

| Row | Animation key | Frames | FPS | Playback |
|---:|---|---:|---:|---|
| 0 | `hero-idle` | 4 | 6 | Loop |
| 1 | `hero-walk` | 6 | 8 | Loop |
| 2 | `hero-run` | 8 | 10 | Loop |
| 3 | `hero-jump` | 4 | 8 | State-driven / one-shot |
| 4 | `hero-fall` | 2 | 8 | Loop while falling |
| 5 | `hero-attack` | 4 | 10 | One-shot; melee attack to match the current combat system |
| 6 | `hero-hurt` | 2 | 8 | One-shot |
| 7 | `hero-death` | 6 | 8 | One-shot |

The row counts and frame rates are project starting values based on the source guide's recommended ranges. Adjust only after observing the animation in the running game.

## 5. Art direction and palette

### Visual identity

- Style: coherent 16-bit-inspired pixel art, side-view platformer.
- Outline: one-pixel dark outline; do not mix outline styles between assets.
- Light direction: top-left for every character, zombie, platform, and prop.
- Background: low-saturation blue-gray / charcoal, lower contrast than gameplay entities.
- Hero: warm skin and cloth highlights, dark clothing, red bandana/scarf, muted olive backpack; the hero must remain the clearest silhouette.
- Zombies: sickly olive/green base with darker green-violet shadows and a limited red/purple infection accent; visually distinct from scenery and pickups.
- Effects: pixel-shaped slash, hit spark, and damage flash; no blurred vector glow or soft anti-aliased particles.

### Palette proposal (shared palette, 16–24 colors initially)

| Role | Proposed color |
|---|---|
| Deep outline | `#171923` |
| Deep shadow | `#252A38` |
| Background dark | `#111827` |
| Background mid | `#263445` |
| Concrete shadow | `#455064` |
| Concrete base | `#758195` |
| Concrete highlight | `#C7D0D9` |
| Hero cloth light | `#E8E2D8` |
| Skin base | `#E8A66C` |
| Skin highlight | `#FFE1B5` |
| Hair shadow | `#38251F` |
| Hair base | `#654331` |
| Hair light | `#8A5A3C` |
| Bandana / danger | `#D94B4B` |
| Hero accent | `#52C7F5` |
| Backpack olive | `#687C4B` |
| Zombie skin | `#9DB66B` |
| Zombie shadow | `#4E704A` |
| Infection accent | `#B7678C` |
| Reward / warning | `#F5B942` |

This palette is a proposed project palette, not a palette prescribed by the source document. Keep it centralized and avoid adding new colors casually.

## 6. Readability and collision rules

- Run a silhouette check: fill the sprite black and confirm Hero and each zombie archetype are still distinguishable.
- Run a grayscale check: Hero, enemy, platforms, and pickups must remain separable without hue.
- Use a smaller hitbox than the artwork for Hero and damaging enemies.
- Enable Phaser Arcade Physics debug drawing during development to inspect body alignment and overlap; disable it for release builds.
- Keep decoration non-collidable unless it is clearly designed as an obstacle.
- Keep visual effects aligned to the same pixel scale as the sprite sheet.

## 7. Animation integration contract

- Load the sheet with the declared 16 × 32 frame size; do not rely on inferred frame dimensions.
- Register animation keys exactly as listed in the sheet contract.
- Use `hero-idle` when stationary, `hero-walk` for normal horizontal movement, `hero-run` when a run state is active, `hero-jump` while rising, and `hero-fall` while descending.
- Play `hero-attack`, `hero-hurt`, and `hero-death` as one-shot actions; return to the appropriate movement state only when the action is complete and the gameplay state permits it.
- Flip horizontally for left-facing movement without changing the pivot.
- Use integer world/render positions where possible; avoid sub-pixel animation jitter.
- Keep HUD fixed to the camera; sort world entities consistently. Suggested draw order: background, building/ground, decoration, platforms, characters/enemies (Y-sort where needed), foreground/effects, HUD.

## 8. Gameplay balance checks during animation integration

The source guide's proposed balance ranges are starting points:

- Player speed should be approximately **110–130%** of a standard enemy's speed so escape remains possible.
- Standard enemy damage should be approximately **5–15%** of player HP per hit.
- Low-tier enemies should take approximately **1–2 hits**; tougher enemies should require more.
- Damage invulnerability should last approximately **0.5–1.0 seconds**.
- Main attack cooldown should be approximately **0.3–0.6 seconds**.
- Increase difficulty gradually (around **10–20%** per stage as a starting point), not by doubling stats.
- Measure maximum jump height and horizontal range using the actual physics values; platform gaps should leave roughly **10–20% safety margin** and must be verified by playtesting.

**Important current-project observation:** The previously inspected prototype used player horizontal speed 220 and standard zombie speed 55 (a 4:1 ratio). That is much faster than the guide's suggested 1.1–1.3:1 ratio. Revisit this after the animation and hitbox integration; do not change it blindly before playtesting because the rising Horde is also a pressure mechanic.

Current combat settings that align with the guide's starting ranges include 10 damage against 100 player HP (10% per hit), an 800 ms damage interval (0.8 s), and a 450 ms attack cooldown (0.45 s). Reconfirm against the current committed source before treating these as final values.

## 9. Horde preparation countdown requirement

This is a project-specific gameplay requirement (not a rule from the pixel-art guide):

- On each new run and each restart, display a **5-second** preparation countdown.
- Display `COUNTDOWN` and `GET READY!`, followed by `HORDE INCOMING!` when the timer finishes.
- Allow the player to move, jump, and attack during preparation.
- Keep the Horde stationary until the countdown reaches zero.
- Restarting must reset the timer and all related state.

## 10. Production and acceptance checklist

### Before producing a sprite
- [ ] Lock 16 × 16 tile size and 480 × 270 internal resolution.
- [ ] Confirm integer scaling / letterboxing plan for desktop and mobile landscape.
- [ ] Confirm 16 × 32 Hero frame and 128 × 256 sheet contract.
- [ ] Confirm shared palette, one-pixel outline, top-left lighting, and right-facing base pose.
- [ ] Ensure the melee attack pose matches the current melee combat system; do not add a gun pose unless ranged weapons are deliberately added to gameplay.

### Before integrating a sprite sheet
- [ ] PNG dimensions exactly match its specification.
- [ ] Transparent background; no labels or decorative panels.
- [ ] Every cell has the same frame canvas and pivot.
- [ ] No Mixels, blur, arbitrary resize, or non-integer scaling.
- [ ] Idle/walk/run/jump/fall/attack/hurt/death sequence is visually readable.
- [ ] Test silhouette and grayscale.

### Before accepting Phase 1.5
- [ ] Hero animations switch correctly from movement and combat state.
- [ ] No sprite jitter between frames or while flipping direction.
- [ ] Hitboxes are verified with debug drawing.
- [ ] Walker / Runner / Climber are visually distinct and balanced.
- [ ] Countdown runs for five seconds and resets on every restart.
- [ ] Test 960 × 540 desktop presentation, 720p/1080p displays, and mobile landscape.
- [ ] Run TypeScript, ESLint, and production build.

---

## 11. Important note on earlier generated art

The earlier concept sheet and the previously described 32 × 48 px Hero frame should be treated as **visual reference only** for this baseline. With a 16 × 16 tile, a 32 × 48 frame is 2 tiles wide × 3 tiles high, exceeding this project's selected target of 1 tile wide × 2 tiles high. Do not scale that sheet down arbitrarily (which risks mixed pixel density); produce a new sheet directly at 16 × 32 px cells. Also, the current gameplay combat is melee, so the production attack animation should show the implemented melee action rather than a firearm unless the game design is intentionally changed.

## 12. Source basis

This project specification is adapted from `pixel-art-game-principles.md`, especially:

- Tile and internal resolution: sections 1–3.
- Entity proportions and avoiding Mixels: sections 4–5.
- Palette, outline, light, readability: sections 6–7.
- Hitboxes, sprite sheet, pivot, FPS: sections 8–9.
- Layering, level and gameplay balance: sections 10–12.
- Production checklist: sections 14–15.

All numerical settings in this specification are project decisions or starting values derived from the guide and must be validated by playtesting.
