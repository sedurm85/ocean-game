# Ocean Treasure Hunt V2 - Game Design Document

## Overview
Transform from "infinite random rain" to an 8-stage run with readable waves, stage-end boss events, strict on-screen caps, and a simple meta loop (stars/unlocks/daily).

## Stage System

### Run Structure
- Total stages: **8**
- Each stage: **60s** (45s main waves + 15s boss event)
- Clear condition: Survive full 60s
- Lives: max 3, no auto-refill between stages

### Stars (per stage, 1-3)
- 1 star: clear stage
- 2 stars: clear + hit count <= 1
- 3 stars: clear + hit count = 0 OR complete stage mission

### Stage Transitions (6s)
1. "Stage Clear!" badge + earned stars
2. Present 3 Sea Blessings (pick 1, lasts next stage only)
3. Next stage title + hint

### Sea Blessings (choose 3 random, no duplicates)
1. +1 Shield charge (6s)
2. Magnet +30% radius
3. Slow-mo +25% duration
4. Combo grace +0.5s
5. +10% treasure points
6. Obstacle warning +0.2s longer telegraph

## 8 Stages

### Stage 1 — Sunny Shallows
- Visual: bright cyan water, sunrays, bubbles
- Mission: Collect 25 Shells
- Event: Bubble Current (gentle L/R current alternates every 2.5s)
- Treasures: Shell, Coral Coin, Starfish
- Obstacles: Jellyfish
- Powerups: Shield, Magnet
- Rainbow Pearl: 1 every 18-22s

### Stage 2 — Coral Carnival
- Visual: colorful coral silhouettes, warm highlights
- Mission: Reach x3 combo 3 times
- Event: Crab Parade (2 random lanes blocked for 1.2s, then swap)
- Treasures: Coral Coin, Starfish, Silver Chest
- Obstacles: Jellyfish, Whirlpool
- Powerups: Magnet, Slow-mo
- Rainbow Pearl: 1 every 16-20s

### Stage 3 — Kelp Maze
- Visual: green kelp columns, darker midwater
- Mission: Collect 8 Starfish
- Event: Eel Beams (warning 0.7s, beam sweeps 1.0s)
- Treasures: Starfish, Silver Chest, Golden Crown
- Obstacles: Whirlpool, Eel Beam
- Powerups: Shield, Dash Fins
- Rainbow Pearl: 1 every 15-18s

### Stage 4 — Shipwreck Salvage
- Visual: ship silhouette, floating planks, dust motes
- Mission: Collect 3 Treasure Maps
- Event: Cannon Volley (telegraph 0.8s, fast drops)
- Treasures: Silver Chest, Golden Crown, Treasure Map (0 pts, +150 stage bonus if 3 collected)
- Obstacles: Sea Mine, Falling Plank
- Powerups: Bubble Burst, Slow-mo
- Rainbow Pearl: 1 every 14-17s

### Stage 5 — Deep Glow Zone
- Visual: deep blue/purple, bioluminescent specks
- Mission: Trigger Fever once
- Event: Kraken Tentacles (3 zones sequential, 0.9s warning + 0.4s impact)
- Treasures: Starfish, Golden Crown, Rainbow Pearl (higher weight)
- Obstacles: Shark, Eel Beam
- Powerups: Shield, Magnet
- Rainbow Pearl: 1 every 12-15s

### Stage 6 — Hydrothermal Vents
- Visual: dark water, orange vent glow, ash particles
- Mission: Collect 12 Coral Coins
- Event: Vent Eruption (3 vents charge 1.0s, burst 0.8s columns)
- Treasures: Coral Coin, Silver Chest, Golden Crown
- Obstacles: Vent Burst, Sea Mine
- Powerups: Bubble Burst, Dash Fins
- Rainbow Pearl: 1 every 13-16s

### Stage 7 — Ice Drift Sea
- Visual: pale teal, ice shards, soft fog
- Mission: Clear with >= 2 lives
- Event: Orca Dash (shadow 1.0s, then dash down lane)
- Treasures: Shell, Starfish, Silver Chest
- Obstacles: Ice Shard, Shark
- Powerups: Shield, Slow-mo
- Rainbow Pearl: 1 every 14-18s

### Stage 8 — Meme Reef Festival
- Visual: neon sea stickers, confetti bubbles
- Mission: Catch meme cameo once
- Event: Meme Time Remix (15s treasure-only + combo boosts + silly SFX)
- Treasures: Golden Crown, Rainbow Pearl, Meme Sticker (50 pts)
- Obstacles: Whirlpool only (low rate)
- Powerups: Magnet, Dash Fins
- Rainbow Pearl: 1 every 10-14s

## Spawn System

### Core Rules (Anti-Clutter)
- 9 lanes (x at 10%..90%)
- Hard cap: maxActiveEntities per stage
- Per-wave budget: normal 3-5, busy 6-7
- Min spacing: 90px vertical in same lane
- Every wave: at least 1 safe lane

### Pattern Templates
1. SingleLine(n=3-5): random distinct lanes
2. VShape(width=5): lanes [4,3,5,2,6]
3. ZigZag(len=5): lane shifts -1/+1
4. GapWall(width=7, gap=2): almost-full with clear gap
5. Pairs(2 pairs): adjacent-lane treasure pairs
6. TreasureTunnel(2 waves): obstacle walls, treasures center
7. Switchback(3 waves): safe lane moves L->C->R
8. RainSlow(6 treasures): many low-value, slow, no obstacles

## Items

### Treasures
- T1 Shell 🐚 10pts
- T2 Coral Coin 🪸 20pts
- T3 Starfish ⭐ 30pts
- T4 Silver Chest 🗃️ 50pts
- T5 Golden Crown 👑 80pts
- T6 Rainbow Pearl 🌈 100pts (Fever trigger)
- T7 Treasure Map 🗺️ special (stage 4)
- T8 Meme Sticker 🎭 50pts (stage 8)

### Obstacles
- O1 Jellyfish 🪼 (existing)
- O2 Shark 🦈 (existing, sideways move)
- O3 Whirlpool 🌊 (existing)
- O4 Sea Mine 💣 (new, bigger hitbox)
- O5 Eel Beam ⚡ (new, lane telegraph)
- O6 Falling Plank 🪵 (new, wide)
- O7 Vent Burst 🌋 (new, column hazard)
- O8 Ice Shard 🧊 (new, diagonal drift)

### Powerups
- P1 Magnet 🧲 (existing)
- P2 Slow-mo ⏱️ (existing)
- P3 Shield 🛡️ (existing)
- P4 Bubble Burst 🫧 (new, clear obstacles in 140px radius)
- P5 Dash Fins 🦶 (new, +40% speed 8s)

### Special
- Heart Bubble ❤️‍🩹 (life recovery, only if lives<=2, 25s cooldown, 8% chance)
- Ddujjonku Bubble 🤡 (meme cameo, once per run guaranteed in stage 3-7, triggers 8s Meme Time)

## Game Feel / Juice

### Treasure Collect
- Punch scale: 1.0 -> 1.35 in 80ms -> 0 in 120ms
- Particles: small=10, chest/crown=18+sparkle, rainbow=28+ring
- Sound: pitch-randomized ±3 semitones
- Screen shake: small=0, chest/crown=2px/80ms, rainbow=6px/160ms

### Obstacle Hit
- Freeze-frame: 0.10s
- Screen shake: 10px for 220ms (ease out)
- Vignette flash: red alpha 0.35 -> 0 over 300ms
- Player blink: 0.8s
- Audio: low thud + lowpass BGM 0.4s

### Combo System
- Timer base: 2.2s between collects
- Extension: shell/coin/star +0.35s, chest/crown +0.45s, rainbow +0.60s
- Multiplier: x1(0-4), x2(5-9), x3(10-19), x4(20-34), x5(35+)
- Rank-up: banner 0.6s, color shift, confetti bubbles

### Stage Clear
- 0.15s freeze-frame
- 60 particles bubble burst from bottom
- Stars pop animation 0.25s each
- 0.9s fanfare stinger

## Difficulty Curve

| Stage | maxActive | waveInterval | speedBase | speedRamp | obstacle% | powerupInterval |
|-------|-----------|-------------|-----------|-----------|-----------|----------------|
| 1     | 8         | 3.2-3.8s    | 140 px/s  | +0.8      | 12%       | 28-35s         |
| 2     | 9         | 3.0-3.6s    | 155 px/s  | +1.0      | 18%       | 26-34s         |
| 3     | 10        | 2.8-3.4s    | 170 px/s  | +1.2      | 24%       | 25-32s         |
| 4     | 11        | 2.6-3.2s    | 185 px/s  | +1.3      | 28%       | 24-32s         |
| 5     | 12        | 2.4-3.0s    | 200 px/s  | +1.5      | 32%       | 24-30s         |
| 6     | 13        | 2.3-2.9s    | 215 px/s  | +1.6      | 34%       | 23-30s         |
| 7     | 14        | 2.2-2.8s    | 230 px/s  | +1.7      | 36%       | 22-28s         |
| 8     | 12        | 2.2-2.6s    | 210 px/s  | +1.2      | 15%       | 20-26s         |

## Visual Palettes

| Stage | Gradient | Accent |
|-------|----------|--------|
| 1 | #7EEBFF → #1AA9FF | sunrays rgba(255,255,220,0.18) |
| 2 | #5FFFE1 → #1C7CFF | coral #FF6B6B, #FFD166 |
| 3 | #1ED68B → #063B6B | kelp rgba(10,80,40,0.35) |
| 4 | #2A6FA8 → #0A1D3A | ship shadows rgba(0,0,0,0.25) |
| 5 | #1B2B6D → #040816 | glow rgba(120,255,220,0.22) |
| 6 | #0C1030 → #02030A | vent rgba(255,120,40,0.25) |
| 7 | #BFF7FF → #2AA0C8 | fog rgba(255,255,255,0.10) |
| 8 | #2C0A5A → #0A1B4F | neon #00F5FF, #FF4DDB, #FFE66D |

## Retention

### Skins (star milestones)
- 6 stars: Blue Wetsuit
- 12 stars: Coral Suit
- 18 stars: Deep Glow Suit
- 24 stars: Meme Festival Suit

### Achievements
- First Catch, Combo Kid (x3), Combo Master (x5)
- Treasure Hunter (200 lifetime), No Ouch! (0-hit stage)
- Fever Friend (10 fevers), Saved! (Heart Bubble)
- Meme Magnet (3 Ddujjonku catches)

### Daily Challenge
- 1 run, 1 stage (2-7), 1 modifier
- Modifiers: Big Treasures, Slippery Current, No Powerups, Treasure Tunnel
- Daily badge + localStorage best score

## Bonus Rounds (between stages 2→3, 4→5, 6→7)
- 10s, no obstacles, only treasures, +30% points
- Patterns: RainSlow + Pairs only
