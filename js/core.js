// 순수 게임 로직. DOM/Firebase/오디오 의존 없음 — node 테스트·시뮬레이션에서 그대로 사용한다.
import {
  DIVER_BASE, PRESSURE_DEPTH, ZONES, MAX_DEPTH, DEPTH_VALUE_SCALE, UPGRADES, DARK_PENALTY,
  SUB_RATE, SUB_ZONE_POW, OFFLINE_CAP_H,
  PRESTIGE_MIN_DEPTH, PRESTIGE_PEARL_PER_M, PEARL_GOLD_BONUS, PEARL_O2_BONUS, PEARL_START_GOLD,
  EVENT_CHANCE, EVENT_COOLDOWN, EVENTS, VERSION,
} from './data.js';

const SAVE_KEY = 'oceanSaveV3';

export function newState(now = 0) {
  const upgrades = {};
  for (const u of UPGRADES) upgrades[u.key] = 0;
  return {
    version: VERSION,
    gold: 0, totalGold: 0,
    pearls: 0, prestiges: 0, deaths: 0, dives: 0,
    maxDepth: 0, lifeMaxDepth: 0, zoneReached: 1,
    upgrades,
    codex: {},          // key -> 발견 횟수
    lastSeen: now,
    dive: null,
  };
}

export function zoneAt(depth) {
  for (let i = ZONES.length - 1; i >= 0; i--) if (depth >= ZONES[i].from) return ZONES[i];
  return ZONES[0];
}

export function upgradeDef(key) { return UPGRADES.find(u => u.key === key); }

export function upgradeCost(state, key) {
  const u = upgradeDef(key);
  const lvl = state.upgrades[key];
  if (lvl >= u.max) return Infinity;
  return Math.round(u.base * Math.pow(u.growth, lvl));
}

export function derived(state) {
  const up = state.upgrades;
  const fins = upgradeDef('fins').per;
  return {
    oxygenMax: DIVER_BASE.oxygen * (1 + state.pearls * PEARL_O2_BONUS) + up.tank * upgradeDef('tank').per,
    descent: DIVER_BASE.descent + up.fins * fins.descent,
    ascent: DIVER_BASE.ascent + up.fins * fins.ascent,
    findChance: Math.min(0.95, DIVER_BASE.findChance + up.lantern * upgradeDef('lantern').per),
    goldMult: (1 + up.net * upgradeDef('net').per) * (1 + state.pearls * PEARL_GOLD_BONUS),
    winBonus: up.harpoon * upgradeDef('harpoon').per,
    subRate: up.sub > 0 ? SUB_RATE * up.sub * Math.pow(state.zoneReached, SUB_ZONE_POW) : 0,
  };
}

export function o2Rate(depth) { return 1 + depth / PRESSURE_DEPTH; }

// 지금 올라가기 시작하면 수면까지 필요한 산소(초)
export function o2NeededToSurface(state, depth = state.dive?.depth ?? 0) {
  const d = derived(state);
  const time = depth / d.ascent;
  const avgRate = 1 + (depth / 2) / PRESSURE_DEPTH;
  return time * avgRate;
}

export function startDive(state) {
  if (state.dive) return false;
  const d = derived(state);
  state.dive = {
    phase: 'descend', depth: 0, o2: d.oxygenMax, o2Max: d.oxygenMax,
    bag: 0, items: [], maxDepth: 0, elapsed: 0,
    findAcc: 0, eventAcc: 0, lastEventAt: -EVENT_COOLDOWN, event: null,
    zoneId: 1, newZones: [],
  };
  state.dives++;
  return true;
}

export function startAscent(state) {
  const dv = state.dive;
  if (!dv || dv.phase !== 'descend') return false;
  dv.phase = 'ascend';
  return true;
}

function pickWeighted(list, rng) {
  const total = list.reduce((s, x) => s + x.w, 0);
  let r = rng() * total;
  for (const x of list) { r -= x.w; if (r <= 0) return x; }
  return list[list.length - 1];
}

function treasureValue(state, zone, depth, base) {
  return base * (1 + depth / DEPTH_VALUE_SCALE) * derived(state).goldMult;
}

function zoneAvgValue(zone) {
  const tw = zone.treasures.reduce((s, t) => s + t.w, 0);
  return zone.treasures.reduce((s, t) => s + t.value * t.w, 0) / tw;
}

function rollTreasure(state, zone, depth, rng, out) {
  const d = derived(state);
  let chance = d.findChance;
  if (zone.dark && state.upgrades.lantern < zone.id - 3) chance *= DARK_PENALTY;
  if (rng() >= chance) return;
  const t = pickWeighted(zone.treasures, rng);
  const value = Math.round(treasureValue(state, zone, depth, t.value));
  state.dive.bag += value;
  state.dive.items.push({ key: t.key, emoji: t.emoji, value });
  state.codex[t.key] = (state.codex[t.key] || 0) + 1;
  out.push({ type: 'find', key: t.key, emoji: t.emoji, value });
}

function rollEvent(state, zone, rng, out) {
  const dv = state.dive;
  if (dv.elapsed - dv.lastEventAt < EVENT_COOLDOWN) return;
  if (rng() >= EVENT_CHANCE) return;
  const pool = EVENTS.filter(e => e.zones.includes(zone.id));
  if (!pool.length) return;
  const ev = pickWeighted(pool, rng);
  dv.phase = 'event';
  dv.event = { key: ev.key, emoji: ev.emoji, zoneId: zone.id };
  dv.lastEventAt = dv.elapsed;
  state.codex[ev.key] = (state.codex[ev.key] || 0) + 1;
  out.push({ type: 'event', key: ev.key, emoji: ev.emoji });
}

export function eventDef(key) { return EVENTS.find(e => e.key === key); }

// 이벤트 선택지의 실제 승률(UI 표시용)
export function choiceWinChance(state, choice) {
  if (!choice.harpoon) return null;
  return Math.min(0.95, choice.base + derived(state).winBonus);
}

function applyOutcome(state, outcome, zone, out) {
  const dv = state.dive;
  const res = { ...outcome };
  if (outcome.o2) dv.o2 = Math.min(dv.o2Max, dv.o2 + outcome.o2);
  if (outcome.bagPct) {
    const delta = Math.round(dv.bag * outcome.bagPct);
    dv.bag = Math.max(0, dv.bag + delta);
    res.bagDelta = delta;
  }
  if (outcome.gold) {
    const value = Math.round(treasureValue(state, zone, dv.depth, zoneAvgValue(zone) * outcome.gold));
    dv.bag += value;
    res.goldGained = value;
  }
  if (outcome.depth) dv.depth = Math.max(0, Math.min(MAX_DEPTH, dv.depth + outcome.depth));
  out.push({ type: 'outcome', ...res });
  return res;
}

export function chooseEvent(state, choiceIdx, rng = Math.random) {
  const dv = state.dive;
  if (!dv || dv.phase !== 'event') return null;
  const ev = eventDef(dv.event.key);
  const choice = ev.choices[choiceIdx];
  if (!choice) return null;
  const zone = ZONES.find(z => z.id === dv.event.zoneId);
  const out = [];
  let won = null;
  if (choice.harpoon) {
    const p = choiceWinChance(state, choice);
    won = rng() < p;
    applyOutcome(state, won ? choice.win : choice.lose, zone, out);
  } else {
    let r = rng();
    let picked = choice.outcomes[choice.outcomes.length - 1];
    for (const o of choice.outcomes) { r -= o.p; if (r <= 0) { picked = o; break; } }
    applyOutcome(state, picked, zone, out);
  }
  dv.event = null;
  dv.phase = 'descend';
  if (dv.o2 <= 0) out.push(...finishDive(state, 'death'));
  return { won, out };
}

function finishDive(state, result) {
  const dv = state.dive;
  const out = [];
  if (result === 'death') {
    state.deaths++;
    out.push({ type: 'death', lost: dv.bag, maxDepth: dv.maxDepth });
  } else {
    state.gold += dv.bag;
    state.totalGold += dv.bag;
    out.push({ type: 'surfaced', bag: dv.bag, items: dv.items, maxDepth: dv.maxDepth, newZones: dv.newZones });
  }
  // 도달 기록은 죽어도 남는다 (수심 기록은 "갔다 온 것"이 아니라 "간 것")
  state.lifeMaxDepth = Math.max(state.lifeMaxDepth, dv.maxDepth);
  state.maxDepth = Math.max(state.maxDepth, dv.maxDepth);
  state.zoneReached = Math.max(state.zoneReached, zoneAt(dv.maxDepth).id);
  state.dive = null;
  return out;
}

// dt초만큼 다이빙을 진행한다. 반환: 발생한 이벤트 목록.
export function tick(state, dt, rng = Math.random) {
  const dv = state.dive;
  const out = [];
  if (!dv || dv.phase === 'event') return out;
  const d = derived(state);
  dv.elapsed += dt;
  dv.o2 -= o2Rate(dv.depth) * dt;

  if (dv.phase === 'descend') {
    dv.depth = Math.min(MAX_DEPTH, dv.depth + d.descent * dt);
    if (dv.depth >= MAX_DEPTH) dv.phase = 'ascend';
  } else {
    dv.depth = Math.max(0, dv.depth - d.ascent * dt);
  }
  if (dv.depth > dv.maxDepth) dv.maxDepth = dv.depth;

  const zone = zoneAt(dv.depth);
  if (zone.id !== dv.zoneId) {
    dv.zoneId = zone.id;
    if (dv.phase === 'descend' && zone.id > state.zoneReached && !dv.newZones.includes(zone.id)) dv.newZones.push(zone.id);
    out.push({ type: 'zone', zoneId: zone.id, descending: dv.phase === 'descend' });
  }

  if (dv.o2 <= 0) { out.push(...finishDive(state, 'death')); return out; }

  if (dv.phase === 'ascend' && dv.depth <= 0) { out.push(...finishDive(state, 'surfaced')); return out; }

  if (dv.phase === 'descend') {
    dv.findAcc += dt;
    while (dv.findAcc >= 1) { dv.findAcc -= 1; rollTreasure(state, zone, dv.depth, rng, out); }
    dv.eventAcc += dt;
    while (dv.eventAcc >= 1 && dv.phase === 'descend') { dv.eventAcc -= 1; rollEvent(state, zone, rng, out); }
  }
  return out;
}

export function buyUpgrade(state, key) {
  if (state.dive) return false;
  const cost = upgradeCost(state, key);
  if (!isFinite(cost) || state.gold < cost) return false;
  state.gold -= cost;
  state.upgrades[key]++;
  return true;
}

export function prestigeGain(state) {
  if (state.lifeMaxDepth < PRESTIGE_MIN_DEPTH) return 0;
  return Math.max(1, Math.floor(state.lifeMaxDepth * PRESTIGE_PEARL_PER_M));
}
export function canPrestige(state) { return !state.dive && prestigeGain(state) > 0; }

export function doPrestige(state) {
  if (!canPrestige(state)) return 0;
  const gain = prestigeGain(state);
  state.pearls += gain;
  state.prestiges++;
  for (const u of UPGRADES) state.upgrades[u.key] = 0;
  state.gold = PEARL_START_GOLD * state.pearls;
  state.lifeMaxDepth = 0;
  state.zoneReached = 1;
  return gain;
}

// 오프라인 채굴 정산. now는 ms epoch. 반환 {gold, hours}
export function collectOffline(state, now) {
  const d = derived(state);
  const elapsedH = Math.max(0, (now - state.lastSeen) / 3600000);
  state.lastSeen = now;
  if (d.subRate <= 0 || elapsedH < 1 / 60) return { gold: 0, hours: 0 };
  const hours = Math.min(OFFLINE_CAP_H, elapsedH);
  const gold = Math.round(d.subRate * hours);
  state.gold += gold; state.totalGold += gold;
  return { gold, hours };
}

export function codexTotal() {
  return ZONES.reduce((s, z) => s + z.treasures.length, 0) + EVENTS.length;
}
export function codexFound(state) { return Object.keys(state.codex).length; }

export function serialize(state) {
  const { dive, ...rest } = state; // 진행 중 다이빙은 저장하지 않는다 (앱 종료 = 구조)
  return JSON.stringify(rest);
}

export function deserialize(json, now = 0) {
  const base = newState(now);
  if (!json) return base;
  let data;
  try { data = JSON.parse(json); } catch (err) { return base; }
  if (!data || typeof data !== 'object') return base;
  const s = { ...base };
  for (const k of ['gold', 'totalGold', 'pearls', 'prestiges', 'deaths', 'dives', 'maxDepth', 'lifeMaxDepth', 'zoneReached', 'lastSeen']) {
    if (typeof data[k] === 'number' && isFinite(data[k])) s[k] = data[k];
  }
  s.upgrades = { ...base.upgrades };
  if (data.upgrades && typeof data.upgrades === 'object') {
    for (const u of UPGRADES) {
      const v = data.upgrades[u.key];
      if (Number.isInteger(v) && v >= 0) s.upgrades[u.key] = Math.min(u.max, v);
    }
  }
  s.codex = (data.codex && typeof data.codex === 'object') ? { ...data.codex } : {};
  s.dive = null;
  return s;
}

export { SAVE_KEY, ZONES, UPGRADES, EVENTS, MAX_DEPTH };
