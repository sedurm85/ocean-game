import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  newState, startDive, startAscent, tick, chooseEvent, o2NeededToSurface, derived,
  buyUpgrade, upgradeCost, prestigeGain, doPrestige, collectOffline, serialize, deserialize, zoneAt,
} from '../js/core.js';
import { mulberry32 } from '../sim/sim.mjs';

const noFind = () => 0.999; // 보물·이벤트 모두 안 나오는 rng

test('zoneAt 경계', () => {
  assert.equal(zoneAt(0).id, 1);
  assert.equal(zoneAt(49.9).id, 1);
  assert.equal(zoneAt(50).id, 2);
  assert.equal(zoneAt(1199).id, 8);
});

test('산소 고갈 → 사망, 가방 손실, 기록은 남음', () => {
  const s = newState();
  startDive(s);
  s.dive.bag = 500;
  let out = [];
  for (let i = 0; i < 200 && s.dive; i++) out = out.concat(tick(s, 1, noFind));
  assert.equal(s.dive, null);
  assert.ok(out.some(e => e.type === 'death'));
  assert.equal(s.gold, 0);
  assert.equal(s.deaths, 1);
  assert.ok(s.maxDepth > 0);
});

test('안전선 안에서 올라오면 생환하고 가방이 정산된다', () => {
  const s = newState();
  startDive(s);
  while (s.dive.o2 - o2NeededToSurface(s) > 1) tick(s, 0.5, noFind);
  s.dive.bag = 123;
  startAscent(s);
  let out = [];
  for (let i = 0; i < 400 && s.dive; i++) out = out.concat(tick(s, 0.5, noFind));
  assert.ok(out.some(e => e.type === 'surfaced'), 'surfaced 이벤트');
  assert.equal(s.gold, 123);
  assert.equal(s.deaths, 0);
});

test('수압: 깊을수록 초당 산소 소모 증가', () => {
  const s = newState();
  startDive(s);
  const o2a = s.dive.o2; tick(s, 1, noFind); const d1 = o2a - s.dive.o2;
  s.dive.depth = 400;
  const o2b = s.dive.o2; tick(s, 1, noFind); const d2 = o2b - s.dive.o2;
  assert.ok(d2 > d1 * 1.6, `${d1} vs ${d2}`); // 400m: 1 + 400/600 = 1.67배
});

test('업그레이드 비용 증가·구매·한도', () => {
  const s = newState();
  s.gold = 1e9;
  const c0 = upgradeCost(s, 'tank');
  assert.ok(buyUpgrade(s, 'tank'));
  assert.ok(upgradeCost(s, 'tank') > c0);
  assert.equal(derived(s).oxygenMax, 35);
  for (let i = 0; i < 100; i++) buyUpgrade(s, 'tank');
  assert.equal(s.upgrades.tank, 40);
  assert.equal(upgradeCost(s, 'tank'), Infinity);
});

test('다이빙 중에는 구매 불가', () => {
  const s = newState(); s.gold = 1e6; startDive(s);
  assert.equal(buyUpgrade(s, 'tank'), false);
});

test('환생: 100m 미만이면 0, 이후 수심 비례, 리셋 + 시작 골드', () => {
  const s = newState();
  s.lifeMaxDepth = 99; assert.equal(prestigeGain(s), 0);
  s.lifeMaxDepth = 400; assert.equal(prestigeGain(s), 10);
  s.gold = 5000; s.upgrades.tank = 5; s.zoneReached = 5; s.codex = { shell: 3 };
  const got = doPrestige(s);
  assert.equal(got, 10);
  assert.equal(s.pearls, 10);
  assert.equal(s.upgrades.tank, 0);
  assert.equal(s.zoneReached, 1);
  assert.equal(s.gold, 600);
  assert.deepEqual(s.codex, { shell: 3 }, '도감은 유지');
  assert.ok(derived(s).goldMult > 1.7);
});

test('오프라인 채굴: 잠수정 없으면 0, 8시간 캡', () => {
  const s = newState(0);
  assert.equal(collectOffline(s, 3600000).gold, 0);
  s.upgrades.sub = 2; s.zoneReached = 3; s.lastSeen = 0;
  const r = collectOffline(s, 20 * 3600000);
  assert.equal(r.hours, 8);
  assert.ok(r.gold > 0);
  assert.equal(s.gold, r.gold);
});

test('이벤트 선택 — 작살 승률과 결과 적용', () => {
  const s = newState();
  startDive(s);
  s.dive.phase = 'event'; s.dive.event = { key: 'shark', emoji: '🦈', zoneId: 2 }; s.dive.depth = 60;
  const r = chooseEvent(s, 2, () => 0.01); // 승리
  assert.equal(r.won, true);
  assert.ok(s.dive.bag > 0);
  assert.equal(s.dive.phase, 'descend');
});

test('직렬화 라운드트립 + 손상 데이터 방어', () => {
  const s = newState(5);
  s.gold = 42; s.upgrades.fins = 3; s.codex = { shell: 1 }; startDive(s);
  const back = deserialize(serialize(s), 0);
  assert.equal(back.gold, 42);
  assert.equal(back.upgrades.fins, 3);
  assert.equal(back.dive, null);
  assert.equal(deserialize('{{{').gold, 0);
  assert.equal(deserialize(JSON.stringify({ upgrades: { tank: 999 } })).upgrades.tank, 40);
  assert.equal(deserialize(JSON.stringify({ gold: 'x' })).gold, 0);
});

test('결정적 rng로 전체 다이빙이 재현된다', () => {
  const run = () => { const s = newState(); const rng = mulberry32(7); startDive(s); while (s.dive) { if (s.dive.phase === 'event') chooseEvent(s, 0, rng); else tick(s, 0.5, rng); } return s; };
  const a = run(), b = run();
  assert.equal(a.deaths, b.deaths); assert.equal(a.maxDepth, b.maxDepth);
});
