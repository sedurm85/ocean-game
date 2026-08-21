const TEXTS = {
  ko: {
    appTitle: '바다 속 보물찾기', appSub: '잠수부 키우기',
    nicknameTitle: '잠수부 이름을 정해요', nicknamePlaceholder: '2~8자 (한글/영문/숫자)', nicknameBtn: '출발!',
    errNicknameLength: '이름은 2~8자로 해주세요', errNicknameInvalid: '한글, 영문, 숫자만 쓸 수 있어요', errNicknameTaken: '이미 있는 이름이에요', errNicknameBad: '다른 이름을 골라주세요', errChecking: '확인 중...',
    greeting: '안녕, {name}! 🤿', surface: '해변 기지', gold: '골드', pearls: '경험 진주',
    dive: '🤿 잠수하기', ascend: '⬆️ 올라가기', ascending: '올라가는 중...', descending: '내려가는 중...',
    depth: '수심', o2: '산소', bag: '가방', safeLine: '안전선', maxDepth: '최고 수심', lifeBest: '이번 생 최고',
    zoneNew: '새로운 구역 발견!', zoneEnter: '{zone} 진입',
    surfacedTitle: '생환! 🎉', surfacedGold: '+{gold} 골드', deathTitle: '산소 부족... 구조됨 🚑', deathBody: '가방 속 보물 {lost}골드를 잃었어요. 하지만 {depth}m까지 간 기록은 남아요.', deathCount: '{n}번째 구조',
    shop: '장비', codex: '도감', rank: '🏆 수심 랭킹', prestige: '🌀 환생', stats: '기록', howto: '게임 방법',
    upgradeLv: 'Lv.{lv}', upgradeMax: 'MAX', buy: '{cost} G',
    up_tank: '산소통', up_tank_d: '산소 +5초', up_fins: '오리발', up_fins_d: '하강·상승 속도 ↑', up_lantern: '랜턴', up_lantern_d: '발견율 +3%, 어두운 곳 탐색', up_harpoon: '작살', up_harpoon_d: '생물 이벤트 승률 +8%', up_net: '그물', up_net_d: '보물 가치 +12%', up_sub: '잠수정', up_sub_d: '앱을 꺼도 자동 채굴 (최대 8시간)',
    prestigeTitle: '환생할까요?', prestigeBody: '장비와 골드를 모두 버리고 새 잠수부로 시작해요.\n대신 경험 진주 +{gain}개를 얻어요.\n진주 1개마다 보물 가치 +8%, 산소 +2.5%가 영원히!', prestigeNeed: '{m}m 이상 내려가야 환생할 수 있어요', prestigeYes: '환생한다', prestigeNo: '아직은',
    prestigeDone: '{n}번째 삶 시작! 진주 {pearls}개 ✨',
    offlineTitle: '잠수정이 다녀왔어요 🛥️', offlineBody: '{h}시간 동안 {gold}골드를 건져왔어요!',
    codexTitle: '도감 {found}/{total}', codexUnknown: '???',
    rankTitle: '🏆 수심 랭킹 TOP 20', rankMe: '나', loading: '불러오는 중...', rankOffline: '오프라인 — 마지막 랭킹', rankEmpty: '아직 기록이 없어요', rankFail: '랭킹을 불러오지 못했어요', close: '닫기',
    statsTitle: '기록', st_dives: '잠수 횟수', st_deaths: '구조 횟수', st_gold: '누적 골드', st_prestige: '환생 횟수', st_max: '최고 수심',
    howtoBody: '🤿 잠수하면 자동으로 내려가요\n💰 내려갈수록 비싼 보물이 나와요\n🫧 산소 게이지의 안전선 전에 올라와야 해요\n🦈 생물을 만나면 선택해요\n🛠️ 골드로 장비를 키우고 더 깊이!\n🌀 막히면 환생 — 진주로 더 강하게',
    eventTitle: '{emoji} {name}',
    ev_shark: '상어가 나타났다!', ev_shark_flee: '도망친다 (산소 -5)', ev_shark_hide: '숨는다 (50% 가방 -30%)', ev_shark_fight: '작살로 싸운다',
    ev_jelly: '해파리 떼!', ev_jelly_push: '뚫고 간다 (산소 -3)', ev_jelly_detour: '돌아간다 (10m 위로)',
    ev_bubble: '산소 방울 발견', ev_bubble_take: '마신다 (산소 +6)',
    ev_chest: '수상한 상자', ev_chest_open: '연다 (70% 보물 / 30% 함정)', ev_chest_ignore: '지나친다',
    ev_current: '해류를 만났다', ev_current_ride: '올라탄다 (+15m 공짜 하강)', ev_current_hold: '버틴다 (산소 -2)',
    ev_wreckroom: '난파선 선실', ev_wreckroom_explore: '들어간다 (60% 큰 보물 / 40% 갇힘)', ev_wreckroom_pass: '지나간다',
    ev_octopus: '대왕 문어!', ev_octopus_ink: '먹물 맞고 도망 (가방 -20%)', ev_octopus_fight: '작살로 싸운다',
    ev_mermaid: '인어를 만났다', ev_mermaid_gift: '선물을 받는다 (가방 ×2)',
    winChance: '승률 {p}%', outWin: '이겼다! +{gold}', outLose: '졌다...', outO2: '산소 {v}', outBag: '가방 {v}', outGold: '+{v} 골드', outDepth: '{v}m', outNothing: '아무 일도 없었다',
    rescueNote: '앱을 끄면 잠수는 중단돼요', connOffline: '오프라인',
    z_shallows: '햇살 얕은 바다', z_coral: '산호 카니발', z_kelp: '켈프 미로', z_wreck: '난파선 무덤', z_glow: '심해 발광층', z_vents: '열수 분출구', z_ice: '빙하 해류', z_atlantis: '아틀란티스',
    z_shallows_h: '조개와 불가사리가 반짝여요', z_coral_h: '상어를 조심하세요', z_kelp_h: '해류를 타면 공짜로 내려가요', z_wreck_h: '여기부터는 랜턴이 필요해요', z_glow_h: '빛나는 진주가 있대요', z_vents_h: '뜨거운 물기둥, 왕관의 전설', z_ice_h: '얼음 속 다이아몬드', z_atlantis_h: '전설의 도시. 인어가 산대요',
    t_shell: '조개', t_coral: '산호 조각', t_starfish: '불가사리', t_coralcoin: '산호 동전', t_pearl: '진주', t_scale: '열대어 비늘', t_kelpgem: '켈프 보석', t_silvercoin: '은화', t_bottle: '유리병 편지', t_silverchest: '은 상자', t_goldcoin: '금화', t_map: '보물 지도', t_glowpearl: '발광 진주', t_crystal: '심해 수정', t_anglerfish: '초롱아귀', t_lavastone: '화산석', t_crown: '황금 왕관', t_blackpearl: '흑진주', t_icediamond: '얼음 다이아', t_relic: '고대 유물', t_narwhal: '일각고래 뿔', t_goldbar: '아틀란티스 금괴', t_orichalcum: '오리하르콘', t_trident: '포세이돈의 삼지창',
    c_shark: '상어', c_jelly: '해파리', c_bubble: '산소 방울', c_chest: '수상한 상자', c_current: '해류', c_wreckroom: '난파선', c_octopus: '대왕 문어', c_mermaid: '인어',
    shareText: '🤿 {name} 잠수부: 최고 수심 {depth}m, 환생 {n}회! #바다속보물찾기',
  },
  en: {
    appTitle: 'Ocean Treasure Hunt', appSub: 'Diver Tycoon',
    nicknameTitle: 'Name your diver', nicknamePlaceholder: '2-8 chars', nicknameBtn: 'Go!',
    errNicknameLength: 'Use 2-8 characters', errNicknameInvalid: 'Letters and numbers only', errNicknameTaken: 'Name already taken', errNicknameBad: 'Please pick another name', errChecking: 'Checking...',
    greeting: 'Hi, {name}! 🤿', surface: 'Beach Base', gold: 'Gold', pearls: 'Pearls',
    dive: '🤿 Dive', ascend: '⬆️ Surface', ascending: 'Ascending...', descending: 'Descending...',
    depth: 'Depth', o2: 'O2', bag: 'Bag', safeLine: 'Safe line', maxDepth: 'Best depth', lifeBest: 'This life',
    zoneNew: 'New zone discovered!', zoneEnter: 'Entering {zone}',
    surfacedTitle: 'Surfaced! 🎉', surfacedGold: '+{gold} gold', deathTitle: 'Out of air... Rescued 🚑', deathBody: 'You lost {lost} gold of treasure, but your {depth}m record stays.', deathCount: 'Rescue #{n}',
    shop: 'Gear', codex: 'Codex', rank: '🏆 Depth Ranking', prestige: '🌀 Rebirth', stats: 'Stats', howto: 'How to play',
    upgradeLv: 'Lv.{lv}', upgradeMax: 'MAX', buy: '{cost} G',
    up_tank: 'Oxygen Tank', up_tank_d: '+5s oxygen', up_fins: 'Fins', up_fins_d: 'Faster descent & ascent', up_lantern: 'Lantern', up_lantern_d: '+3% find rate, explore dark zones', up_harpoon: 'Harpoon', up_harpoon_d: '+8% win chance vs creatures', up_net: 'Net', up_net_d: '+12% treasure value', up_sub: 'Submarine', up_sub_d: 'Mines gold while away (max 8h)',
    prestigeTitle: 'Rebirth?', prestigeBody: 'Give up all gear and gold to start as a new diver.\nYou gain +{gain} Experience Pearls.\nEach pearl: +8% treasure value, +2.5% oxygen, forever!', prestigeNeed: 'Reach {m}m to unlock rebirth', prestigeYes: 'Rebirth', prestigeNo: 'Not yet',
    prestigeDone: 'Life #{n} begins! {pearls} pearls ✨',
    offlineTitle: 'Your submarine returned 🛥️', offlineBody: 'It mined {gold} gold over {h} hours!',
    codexTitle: 'Codex {found}/{total}', codexUnknown: '???',
    rankTitle: '🏆 Depth Ranking TOP 20', rankMe: 'me', loading: 'Loading...', rankOffline: 'Offline — last known ranking', rankEmpty: 'No records yet', rankFail: 'Could not load ranking', close: 'Close',
    statsTitle: 'Stats', st_dives: 'Dives', st_deaths: 'Rescues', st_gold: 'Total gold', st_prestige: 'Rebirths', st_max: 'Best depth',
    howtoBody: '🤿 Dive and sink automatically\n💰 Deeper = pricier treasure\n🫧 Surface before the safe line on the O2 gauge\n🦈 Meet creatures, make choices\n🛠️ Upgrade gear with gold, go deeper!\n🌀 Stuck? Rebirth for permanent pearls',
    eventTitle: '{emoji} {name}',
    ev_shark: 'A shark appears!', ev_shark_flee: 'Flee (O2 -5)', ev_shark_hide: 'Hide (50%: bag -30%)', ev_shark_fight: 'Fight with harpoon',
    ev_jelly: 'Jellyfish swarm!', ev_jelly_push: 'Push through (O2 -3)', ev_jelly_detour: 'Detour (up 10m)',
    ev_bubble: 'Air bubble found', ev_bubble_take: 'Breathe (O2 +6)',
    ev_chest: 'Suspicious chest', ev_chest_open: 'Open (70% loot / 30% trap)', ev_chest_ignore: 'Ignore',
    ev_current: 'A current!', ev_current_ride: 'Ride it (+15m free)', ev_current_hold: 'Hold on (O2 -2)',
    ev_wreckroom: 'Shipwreck cabin', ev_wreckroom_explore: 'Enter (60% big loot / 40% stuck)', ev_wreckroom_pass: 'Pass',
    ev_octopus: 'Giant octopus!', ev_octopus_ink: 'Inked, flee (bag -20%)', ev_octopus_fight: 'Fight with harpoon',
    ev_mermaid: 'A mermaid!', ev_mermaid_gift: 'Accept gift (bag ×2)',
    winChance: '{p}% win', outWin: 'Won! +{gold}', outLose: 'Lost...', outO2: 'O2 {v}', outBag: 'Bag {v}', outGold: '+{v} gold', outDepth: '{v}m', outNothing: 'Nothing happened',
    rescueNote: 'Closing the app ends the dive', connOffline: 'Offline',
    z_shallows: 'Sunny Shallows', z_coral: 'Coral Carnival', z_kelp: 'Kelp Maze', z_wreck: 'Shipwreck Graveyard', z_glow: 'Deep Glow Zone', z_vents: 'Hydrothermal Vents', z_ice: 'Ice Drift', z_atlantis: 'Atlantis',
    z_shallows_h: 'Shells and starfish sparkle here', z_coral_h: 'Watch out for sharks', z_kelp_h: 'Ride currents for free depth', z_wreck_h: 'You need a lantern from here', z_glow_h: 'Glowing pearls, they say', z_vents_h: 'Hot vents and a legendary crown', z_ice_h: 'Diamonds in the ice', z_atlantis_h: 'The lost city. Mermaids live here',
    t_shell: 'Shell', t_coral: 'Coral Piece', t_starfish: 'Starfish', t_coralcoin: 'Coral Coin', t_pearl: 'Pearl', t_scale: 'Fish Scale', t_kelpgem: 'Kelp Gem', t_silvercoin: 'Silver Coin', t_bottle: 'Message Bottle', t_silverchest: 'Silver Chest', t_goldcoin: 'Gold Coin', t_map: 'Treasure Map', t_glowpearl: 'Glow Pearl', t_crystal: 'Deep Crystal', t_anglerfish: 'Anglerfish', t_lavastone: 'Lava Stone', t_crown: 'Golden Crown', t_blackpearl: 'Black Pearl', t_icediamond: 'Ice Diamond', t_relic: 'Ancient Relic', t_narwhal: 'Narwhal Horn', t_goldbar: 'Atlantis Gold Bar', t_orichalcum: 'Orichalcum', t_trident: "Poseidon's Trident",
    c_shark: 'Shark', c_jelly: 'Jellyfish', c_bubble: 'Air Bubble', c_chest: 'Chest', c_current: 'Current', c_wreckroom: 'Shipwreck', c_octopus: 'Giant Octopus', c_mermaid: 'Mermaid',
    shareText: '🤿 Diver {name}: best depth {depth}m, {n} rebirths! #OceanTreasureHunt',
  },
};

export let lang = 'ko';
export function initLanguage() {
  const nav = (navigator.language || 'ko').toLowerCase();
  lang = nav.startsWith('ko') ? 'ko' : 'en';
  document.documentElement.lang = lang;
}
export function t(key, vars) {
  let s = (TEXTS[lang] && TEXTS[lang][key]) ?? TEXTS.ko[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split('{' + k + '}').join(String(v));
  return s;
}
export function fmt(n) { return Math.round(n).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US'); }
