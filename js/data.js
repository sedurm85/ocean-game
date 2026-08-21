// 테마·밸런스 데이터. 이 파일만 교체하면 다른 키우기 테마로 재스킨할 수 있다.
// 시간 단위는 전부 초, 거리는 m, 속도는 m/s.

export const DIVER_BASE = {
  oxygen: 30,        // 초
  descent: 2.0,      // m/s
  ascent: 4.0,       // m/s
  findChance: 0.55,  // 틱당 보물 발견 확률
};

// 수압: 수심 d에서 초당 산소 소모량 = 1 + d / PRESSURE_DEPTH
export const PRESSURE_DEPTH = 600;

export const ZONES = [
  { id: 1, key: 'shallows',  from: 0,    to: 50,   dark: false, bg: ['#7EEBFF', '#1AA9FF'], floor: 'rgba(240,220,160,0.6)', weed: 'rgba(40,160,90,0.5)',
    treasures: [{ key: 'shell', emoji: '🐚', value: 5, w: 5 }, { key: 'coral', emoji: '🪸', value: 8, w: 3 }, { key: 'starfish', emoji: '⭐', value: 12, w: 2 }] },
  { id: 2, key: 'coral',     from: 50,   to: 120,  dark: false, bg: ['#5FFFE1', '#1C7CFF'], floor: 'rgba(255,107,107,0.35)', weed: 'rgba(255,209,102,0.4)',
    treasures: [{ key: 'coralcoin', emoji: '🪙', value: 20, w: 5 }, { key: 'pearl', emoji: '⚪', value: 35, w: 2 }, { key: 'scale', emoji: '🐠', value: 25, w: 3 }] },
  { id: 3, key: 'kelp',      from: 120,  to: 220,  dark: false, bg: ['#1ED68B', '#063B6B'], floor: 'rgba(10,80,40,0.6)', weed: 'rgba(10,120,60,0.6)',
    treasures: [{ key: 'kelpgem', emoji: '💚', value: 60, w: 4 }, { key: 'silvercoin', emoji: '🥈', value: 80, w: 3 }, { key: 'bottle', emoji: '🍾', value: 110, w: 1 }] },
  { id: 4, key: 'wreck',     from: 220,  to: 350,  dark: true,  bg: ['#2A6FA8', '#0A1D3A'], floor: 'rgba(0,0,0,0.35)', weed: 'rgba(120,90,60,0.4)',
    treasures: [{ key: 'silverchest', emoji: '🗃️', value: 150, w: 4 }, { key: 'goldcoin', emoji: '🟡', value: 200, w: 3 }, { key: 'map', emoji: '🗺️', value: 300, w: 1 }] },
  { id: 5, key: 'glow',      from: 350,  to: 520,  dark: true,  bg: ['#1B2B6D', '#040816'], floor: 'rgba(120,255,220,0.25)', weed: 'rgba(120,255,220,0.3)',
    treasures: [{ key: 'glowpearl', emoji: '🔮', value: 400, w: 4 }, { key: 'crystal', emoji: '💎', value: 550, w: 2 }, { key: 'anglerfish', emoji: '🐡', value: 480, w: 2 }] },
  { id: 6, key: 'vents',     from: 520,  to: 720,  dark: true,  bg: ['#0C1030', '#02030A'], floor: 'rgba(255,120,40,0.35)', weed: 'rgba(255,120,40,0.25)',
    treasures: [{ key: 'lavastone', emoji: '🌋', value: 900, w: 4 }, { key: 'crown', emoji: '👑', value: 1200, w: 2 }, { key: 'blackpearl', emoji: '⚫', value: 1500, w: 1 }] },
  { id: 7, key: 'ice',       from: 720,  to: 950,  dark: true,  bg: ['#BFF7FF', '#2AA0C8'], floor: 'rgba(255,255,255,0.35)', weed: 'rgba(200,240,255,0.3)',
    treasures: [{ key: 'icediamond', emoji: '🧊', value: 2000, w: 4 }, { key: 'relic', emoji: '🏺', value: 2600, w: 2 }, { key: 'narwhal', emoji: '🦄', value: 3200, w: 1 }] },
  { id: 8, key: 'atlantis',  from: 950,  to: 1200, dark: true,  bg: ['#2C0A5A', '#0A1B4F'], floor: 'rgba(0,245,255,0.3)', weed: 'rgba(255,77,219,0.3)',
    treasures: [{ key: 'goldbar', emoji: '🧱', value: 5000, w: 4 }, { key: 'orichalcum', emoji: '🟣', value: 8000, w: 2 }, { key: 'trident', emoji: '🔱', value: 20000, w: 1 }] },
];
export const MAX_DEPTH = ZONES[ZONES.length - 1].to;

// 수심 보정: 같은 존 안에서도 깊을수록 가치 상승
export const DEPTH_VALUE_SCALE = 200; // value × (1 + depth / 200)

// 장비. cost(lvl) = base × growth^lvl. effect는 레벨당 증가량.
export const UPGRADES = [
  { key: 'tank',    emoji: '🫧', base: 30,  growth: 1.36, max: 40, per: 5 },     // 산소 +5s
  { key: 'fins',    emoji: '🩴', base: 40,  growth: 1.40, max: 30, per: { descent: 0.25, ascent: 0.45 } },
  { key: 'lantern', emoji: '🔦', base: 60,  growth: 1.45, max: 20, per: 0.03 },  // 발견율 +3%p, 어두운 존 페널티 해제
  { key: 'harpoon', emoji: '🔱', base: 50,  growth: 1.42, max: 20, per: 0.08 },  // 이벤트 승률 +8%p
  { key: 'net',     emoji: '🕸️', base: 80,  growth: 1.42, max: 30, per: 0.12 },  // 보물 가치 +12%
  { key: 'sub',     emoji: '🛥️', base: 150, growth: 1.55, max: 20, per: 1 },     // 오프라인 채굴
];

// 어두운 존에서 랜턴 레벨이 (zone.id - 3) 미만이면 발견율 절반
export const DARK_PENALTY = 0.5;

// 오프라인 채굴: 시간당 골드 = SUB_RATE × subLvl × zoneReached^SUB_ZONE_POW, 최대 OFFLINE_CAP_H 시간
export const SUB_RATE = 12;
export const SUB_ZONE_POW = 1.7;
export const OFFLINE_CAP_H = 8;

// 환생(경험 진주): 이번 생 최대 수심 기준. 진주 1개당 골드 +8%, 산소 +2.5%
export const PRESTIGE_MIN_DEPTH = 100;
export const PRESTIGE_PEARL_PER_M = 1 / 40;
export const PEARL_GOLD_BONUS = 0.08;
export const PEARL_O2_BONUS = 0.025;
export const PEARL_START_GOLD = 60;

// 이벤트 카드. 틱당 EVENT_CHANCE 확률, 마지막 이벤트 후 EVENT_COOLDOWN초 이내엔 미발생.
// 선택지 효과: o2(초), bagPct(가방 %), gold(존 보물 평균 × 배수), depth(m), winChance(작살 보정 여부)
export const EVENT_CHANCE = 0.09;
export const EVENT_COOLDOWN = 6;
export const EVENTS = [
  { key: 'shark', emoji: '🦈', zones: [2, 3, 4, 5, 6, 7, 8], w: 5, choices: [
    { key: 'flee',  outcomes: [{ p: 1, o2: -5 }] },
    { key: 'hide',  outcomes: [{ p: 0.5 }, { p: 0.5, bagPct: -0.3 }] },
    { key: 'fight', harpoon: true, base: 0.35, win: { gold: 3 }, lose: { o2: -8 } },
  ] },
  { key: 'jelly', emoji: '🪼', zones: [1, 2, 3], w: 4, choices: [
    { key: 'push',   outcomes: [{ p: 1, o2: -3 }] },
    { key: 'detour', outcomes: [{ p: 1, depth: -10 }] },
  ] },
  { key: 'bubble', emoji: '🫧', zones: [1, 2, 3, 4, 5, 6, 7, 8], w: 3, choices: [
    { key: 'take', outcomes: [{ p: 1, o2: 6 }] },
  ] },
  { key: 'chest', emoji: '📦', zones: [2, 3, 4, 5, 6, 7, 8], w: 4, choices: [
    { key: 'open',   outcomes: [{ p: 0.7, gold: 2.5 }, { p: 0.3, o2: -5 }] },
    { key: 'ignore', outcomes: [{ p: 1 }] },
  ] },
  { key: 'current', emoji: '🌀', zones: [3, 4, 5, 6, 7, 8], w: 3, choices: [
    { key: 'ride', outcomes: [{ p: 1, depth: 15 }] },
    { key: 'hold', outcomes: [{ p: 1, o2: -2 }] },
  ] },
  { key: 'wreckroom', emoji: '🚢', zones: [4, 5, 6], w: 3, choices: [
    { key: 'explore', outcomes: [{ p: 0.6, gold: 4 }, { p: 0.4, o2: -6 }] },
    { key: 'pass',    outcomes: [{ p: 1 }] },
  ] },
  { key: 'octopus', emoji: '🐙', zones: [5, 6, 7, 8], w: 3, choices: [
    { key: 'ink',   outcomes: [{ p: 1, bagPct: -0.2 }] },
    { key: 'fight', harpoon: true, base: 0.3, win: { gold: 4 }, lose: { bagPct: -0.4 } },
  ] },
  { key: 'mermaid', emoji: '🧜‍♀️', zones: [8], w: 1, choices: [
    { key: 'gift', outcomes: [{ p: 1, bagPct: 1.0 }] },
  ] },
];

// 도감: 존 보물 24종 + 이벤트 생물 8종
export const CODEX_EVENT_KEYS = EVENTS.map(e => e.key);

export const VERSION = '3.0.0';
