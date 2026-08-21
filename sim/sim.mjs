// 밸런스 시뮬레이션: 합리적인 봇이 플레이했을 때 존 도달 시간·환생 주기를 측정한다.
// 실행: node sim/sim.mjs [risk=1] [seed=1]
import {
  newState, startDive, startAscent, tick, chooseEvent, eventDef, choiceWinChance,
  o2NeededToSurface, buyUpgrade, upgradeCost, canPrestige, prestigeGain, doPrestige, collectOffline,
  zoneAt, ZONES, UPGRADES,
} from '../js/core.js';

export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const DIVE_OVERHEAD_S = 4; // 정산·메뉴 조작 시간

function slack(state) { return state.dive.o2 - o2NeededToSurface(state); }

function pickChoice(state, rng) {
  const dv = state.dive;
  const ev = eventDef(dv.event.key);
  const s = slack(state);
  const idx = (k) => ev.choices.findIndex(c => c.key === k);
  switch (ev.key) {
    case 'bubble': return idx('take');
    case 'chest': return idx('open');
    case 'jelly': return idx('push');
    case 'current': return s > 12 ? idx('ride') : idx('hold');
    case 'wreckroom': return s > 10 ? idx('explore') : idx('pass');
    case 'shark': return choiceWinChance(state, ev.choices[idx('fight')]) >= 0.5 ? idx('fight') : idx('flee');
    case 'octopus': return choiceWinChance(state, ev.choices[idx('fight')]) >= 0.5 ? idx('fight') : idx('ink');
    case 'mermaid': return idx('gift');
    default: return 0;
  }
}

// risk: 1 = 보통(여유 2초+수심 보정), 0.5 = 겁쟁이, 2 = 무모
function runDive(state, rng, risk) {
  startDive(state);
  let t = 0;
  const step = 0.5;
  while (state.dive) {
    const dv = state.dive;
    if (dv.phase === 'event') { chooseEvent(state, pickChoice(state, rng), rng); continue; }
    if (dv.phase === 'descend') {
      const margin = (2 + dv.depth / 150) / risk;
      if (slack(state) <= margin) startAscent(state);
    }
    tick(state, step, rng);
    t += step;
  }
  return t + DIVE_OVERHEAD_S;
}

function shop(state) {
  let bought = 0;
  for (;;) {
    const nextZone = ZONES.find(z => z.id === Math.min(8, state.zoneReached + 1));
    const candidates = [];
    if (nextZone.dark && state.upgrades.lantern < nextZone.id - 3) candidates.push('lantern');
    candidates.push('tank', 'fins', 'net');
    if (state.upgrades.harpoon < Math.floor(state.upgrades.tank / 2)) candidates.push('harpoon');
    if (upgradeCost(state, 'sub') < state.gold * 0.25) candidates.push('sub');
    const affordable = candidates.filter(k => upgradeCost(state, k) <= state.gold);
    if (!affordable.length) return bought;
    affordable.sort((a, b) => upgradeCost(state, a) - upgradeCost(state, b));
    buyUpgrade(state, affordable[0]);
    bought++;
  }
}

export function simulate({ risk = 1, seed = 1, maxHours = 6, casual = false, log = () => {} } = {}) {
  const rng = mulberry32(seed);
  const state = newState(0);
  let playS = 0, wallS = 0, sessionS = 0, stalled = 0;
  const zoneTimes = {};
  const prestigeLog = [];
  let lastPrestigeDives = 0;
  while (playS < maxHours * 3600 && !zoneTimes[8]) {
    const before = state.zoneReached;
    const dt = runDive(state, rng, risk);
    playS += dt; wallS += dt; sessionS += dt;
    for (let z = before + 1; z <= state.zoneReached; z++) if (!zoneTimes[z]) {
      zoneTimes[z] = { playMin: playS / 60, wallH: wallS / 3600, dives: state.dives, prestiges: state.prestiges };
      log(`존 ${z} 도달: 플레이 ${(playS / 60).toFixed(1)}분, ${state.dives}회 다이빙, 환생 ${state.prestiges}회, 진주 ${state.pearls}`);
    }
    const bought = shop(state);
    stalled = bought ? 0 : stalled + 1;
    if (canPrestige(state) && stalled >= 3) {
      const gain = prestigeGain(state);
      if (gain >= Math.max(2, Math.round(state.pearls * 0.35))) {
        prestigeLog.push({ playMin: playS / 60, gain, pearlsAfter: state.pearls + gain, depth: state.lifeMaxDepth, divesInLife: state.dives - lastPrestigeDives });
        log(`  환생 #${state.prestiges + 1}: 진주 +${gain} (수심 ${Math.round(state.lifeMaxDepth)}m, 이번 생 ${state.dives - lastPrestigeDives}회) @ ${(playS / 60).toFixed(1)}분`);
        doPrestige(state); stalled = 0; lastPrestigeDives = state.dives;
        shop(state);
      }
    }
    if (casual && sessionS >= 600) {
      sessionS = 0;
      const gap = 7.5 * 3600;
      wallS += gap;
      const got = collectOffline(state, (state.lastSeen + gap * 1000));
      state.lastSeen += gap * 1000;
      if (got.gold) log(`  오프라인 ${got.hours.toFixed(1)}h → +${got.gold}골드`);
      shop(state);
    } else {
      state.lastSeen += dt * 1000;
    }
  }
  return { zoneTimes, prestigeLog, state, playMin: playS / 60, wallH: wallS / 3600 };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const risk = Number(process.argv[2] || 1), seed = Number(process.argv[3] || 1), casual = process.argv[4] === 'casual';
  const r = simulate({ risk, seed, casual, log: console.log });
  const s = r.state;
  console.log('\n=== 요약 ===');
  console.log(`총 플레이 ${r.playMin.toFixed(0)}분 (벽시계 ${r.wallH.toFixed(1)}h), 다이빙 ${s.dives}회, 사망 ${s.deaths}회 (${(100 * s.deaths / s.dives).toFixed(0)}%), 환생 ${s.prestiges}회, 진주 ${s.pearls}, 최대 수심 ${Math.round(s.maxDepth)}m`);
  console.log('장비:', Object.entries(s.upgrades).map(([k, v]) => `${k}${v}`).join(' '));
  console.log('존 도달:', Object.entries(r.zoneTimes).map(([z, v]) => `Z${z}@${v.playMin.toFixed(0)}m`).join('  '));
}
