import {
  newState, deserialize, serialize, SAVE_KEY, startDive, startAscent, tick, chooseEvent, eventDef, choiceWinChance,
  o2NeededToSurface, derived, buyUpgrade, upgradeCost, upgradeDef, prestigeGain, canPrestige, doPrestige,
  collectOffline, zoneAt, codexTotal, codexFound, ZONES, UPGRADES, EVENTS, MAX_DEPTH,
} from './core.js';
import { PRESTIGE_MIN_DEPTH } from './data.js';
import { initLanguage, t, fmt } from './i18n.js';
import * as audio from './audio.js';
import * as fb from './firebase.js';
import * as bg from './bg.js';

const $ = (id) => document.getElementById(id);
let state = newState(Date.now());
let lastFrame = 0, saveTimer = 0, lastSyncedDepth = 0;

// ---------- UI 유틸 ----------
function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }
function openModal(id) { show(id); }
function closeModals() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }
let toastTimer = null;
function toast(msg, ms = 1800) {
  const el = $('toast'); el.textContent = msg; show('toast');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => hide('toast'), ms);
}
function floatText(text, cls = '') {
  const layer = $('float-layer');
  if (layer.childElementCount > 12) layer.firstElementChild.remove();
  const el = document.createElement('div');
  el.className = 'float ' + cls; el.textContent = text;
  el.style.top = (40 + Math.random() * 20) + '%';
  el.style.marginLeft = (Math.random() * 80 - 40) + 'px';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $('nickname-input').placeholder = t('nicknamePlaceholder');
  $('howto-body').textContent = t('howtoBody');
}
function zoneName(z) { return t('z_' + z.key); }

// ---------- 저장 ----------
function save() {
  state.lastSeen = Date.now();
  try { localStorage.setItem(SAVE_KEY, serialize(state)); } catch (err) { /* 저장소 불가 환경 */ }
}
function load() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (err) { raw = null; }
  state = deserialize(raw, Date.now());
  lastSyncedDepth = state.maxDepth;
}

// ---------- 해변 기지 ----------
function renderPills() {
  $('gold').textContent = fmt(state.gold);
  $('pearls').textContent = fmt(state.pearls);
}
function renderSurface() {
  renderPills();
  const p = fb.getPlayer();
  $('greeting').textContent = p ? t('greeting', { name: p.nickname }) : t('surface');
  $('best-depth').textContent = fmt(state.maxDepth);
  $('life-depth').textContent = fmt(state.lifeMaxDepth);
  const d = derived(state);
  if (d.subRate > 0) { $('sub-rate').textContent = `🛥️ ${fmt(d.subRate)} G/h`; show('sub-rate'); } else hide('sub-rate');
  $('prestige-btn').style.opacity = canPrestige(state) ? '1' : '0.55';
}
function goSurface() {
  hide('dive-screen'); hide('nickname-screen'); show('surface-screen');
  bg.setView({ depth: 0, phase: 'surface' });
  audio.setDepthMood(0);
  renderSurface();
}

// ---------- 잠수 ----------
function beginDive() {
  if (!startDive(state)) return;
  hide('surface-screen'); show('dive-screen');
  $('ascend-btn').disabled = false;
  $('phase-text').textContent = t('descending');
  $('bag-items').textContent = '';
  $('float-layer').replaceChildren();
  bg.setView({ phase: 'descend', depth: 0 });
  updateZoneLabel(zoneAt(0));
  renderHud();
}
function updateZoneLabel(z) {
  $('zone-name').textContent = zoneName(z);
  $('zone-hint').textContent = t('z_' + z.key + '_h');
}
function renderHud() {
  const dv = state.dive; if (!dv) return;
  $('depth').textContent = Math.round(dv.depth);
  $('bag').textContent = fmt(dv.bag);
  const need = o2NeededToSurface(state);
  const pct = Math.max(0, dv.o2 / dv.o2Max * 100);
  const fill = $('o2-fill');
  fill.style.width = pct + '%';
  fill.className = 'o2-fill' + (dv.o2 < need + 2 ? ' danger' : dv.o2 < need + 6 ? ' warn' : '');
  $('safe-line').style.left = Math.min(100, need / dv.o2Max * 100) + '%';
  $('o2-sec').textContent = Math.max(0, dv.o2).toFixed(0);
  $('safe-sec').textContent = need.toFixed(0);
  $('bag-items').textContent = dv.items.slice(-8).map(i => i.emoji).join('');
}
function handleEvents(out) {
  for (const e of out) {
    switch (e.type) {
      case 'find': {
        floatText(`${e.emoji} +${fmt(e.value)}`);
        const big = e.value >= zoneAt(state.dive?.depth ?? 0).treasures[0].value * 4;
        audio.sfx(big ? 'bigfind' : 'find');
        bg.burst(big ? 14 : 5, '#ffd700');
        break;
      }
      case 'zone': {
        const z = ZONES.find(x => x.id === e.zoneId);
        updateZoneLabel(z);
        if (e.descending) {
          const isNew = state.dive && state.dive.newZones.includes(z.id);
          toast((isNew ? t('zoneNew') + ' ' : '') + t('zoneEnter', { zone: zoneName(z) }));
          audio.sfx(isNew ? 'bigfind' : 'buy');
        }
        break;
      }
      case 'event': openEvent(); break;
      case 'death': onDeath(e); break;
      case 'surfaced': onSurfaced(e); break;
      default: break;
    }
  }
}
function onDeath(e) {
  audio.sfx('death');
  $('app').classList.add('shake', 'flash');
  setTimeout(() => $('app').classList.remove('shake', 'flash'), 400);
  $('result-emoji').textContent = '🚑';
  $('result-title').textContent = t('deathTitle');
  $('result-body').textContent = t('deathBody', { lost: fmt(e.lost), depth: Math.round(e.maxDepth) }) + '\n' + t('deathCount', { n: state.deaths });
  $('result-items').textContent = '';
  openModal('result-modal');
  afterDive();
}
function onSurfaced(e) {
  audio.sfx('surface');
  $('result-emoji').textContent = '🏖️';
  $('result-title').textContent = t('surfacedTitle');
  let body = t('surfacedGold', { gold: fmt(e.bag) }) + `\n${t('maxDepth')}: ${Math.round(e.maxDepth)}m`;
  if (e.newZones.length) body += '\n' + t('zoneNew') + ' ' + e.newZones.map(id => zoneName(ZONES.find(z => z.id === id))).join(', ');
  $('result-body').textContent = body;
  const counts = {};
  for (const it of e.items) counts[it.emoji] = (counts[it.emoji] || 0) + 1;
  $('result-items').textContent = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([em, n]) => `${em}×${n}`).join(' ');
  openModal('result-modal');
  afterDive();
}
function afterDive() {
  save();
  if (state.maxDepth > lastSyncedDepth) { lastSyncedDepth = state.maxDepth; fb.syncDepth(state.maxDepth); }
}

// ---------- 이벤트 카드 ----------
function openEvent() {
  const dv = state.dive; const ev = eventDef(dv.event.key);
  $('event-emoji').textContent = ev.emoji;
  $('event-title').textContent = t('ev_' + ev.key);
  const box = $('event-choices'); box.replaceChildren();
  hide('event-result');
  audio.sfx(['bubble', 'chest', 'mermaid', 'current'].includes(ev.key) ? 'heal' : 'warn');
  ev.choices.forEach((c, idx) => {
    const b = document.createElement('button'); b.className = 'choice';
    const label = document.createElement('span'); label.textContent = t(`ev_${ev.key}_${c.key}`);
    b.appendChild(label);
    const p = choiceWinChance(state, c);
    if (p !== null) { const pct = document.createElement('span'); pct.className = 'pct'; pct.textContent = t('winChance', { p: Math.round(p * 100) }); b.appendChild(pct); }
    b.addEventListener('click', () => resolveEvent(idx));
    box.appendChild(b);
  });
  bg.setView({ phase: 'event' });
  openModal('event-modal');
}
function outcomeText(r) {
  const parts = [];
  if (r.won === true) parts.push(t('outWin', { gold: fmt(r.goldGained || 0) }));
  else if (r.won === false) parts.push(t('outLose'));
  if (r.o2) parts.push(t('outO2', { v: (r.o2 > 0 ? '+' : '') + r.o2 }));
  if (r.bagDelta) parts.push(t('outBag', { v: (r.bagDelta > 0 ? '+' : '') + fmt(r.bagDelta) }));
  if (r.goldGained && r.won !== true) parts.push(t('outGold', { v: fmt(r.goldGained) }));
  if (r.depth) parts.push(t('outDepth', { v: (r.depth > 0 ? '+' : '') + r.depth }));
  return parts.length ? parts.join(' · ') : t('outNothing');
}
function resolveEvent(idx) {
  const r = chooseEvent(state, idx);
  if (!r) return;
  const outcome = r.out.find(o => o.type === 'outcome') || {};
  const res = { ...outcome, won: r.won };
  const good = (r.won === true) || (outcome.o2 > 0) || (outcome.bagDelta > 0) || (outcome.goldGained > 0) || (outcome.depth > 0);
  $('event-result').textContent = outcomeText(res);
  $('event-result').style.color = good ? '#ffd700' : '#ff6b6b';
  show('event-result');
  $('event-choices').querySelectorAll('button').forEach(b => { b.disabled = true; });
  audio.sfx(good ? 'heal' : 'hit');
  if (!good) { $('app').classList.add('shake'); setTimeout(() => $('app').classList.remove('shake'), 300); }
  setTimeout(() => {
    hide('event-modal');
    if (state.dive) bg.setView({ phase: state.dive.phase });
    handleEvents(r.out.filter(o => o.type === 'death'));
  }, 1000);
}

// ---------- 장비 ----------
function renderShop() {
  const list = $('shop-list'); list.replaceChildren();
  for (const u of UPGRADES) {
    const lv = state.upgrades[u.key], cost = upgradeCost(state, u.key);
    const row = document.createElement('div'); row.className = 'up-item';
    const em = document.createElement('div'); em.className = 'em'; em.textContent = u.emoji;
    const info = document.createElement('div'); info.className = 'info';
    const name = document.createElement('div'); name.className = 'name'; name.textContent = t('up_' + u.key);
    const lvEl = document.createElement('span'); lvEl.textContent = t('upgradeLv', { lv }); name.appendChild(lvEl);
    const desc = document.createElement('div'); desc.className = 'desc'; desc.textContent = t('up_' + u.key + '_d');
    info.append(name, desc);
    const buy = document.createElement('button'); buy.className = 'buy';
    if (!isFinite(cost)) { buy.textContent = t('upgradeMax'); buy.disabled = true; }
    else { buy.textContent = t('buy', { cost: fmt(cost) }); buy.disabled = state.gold < cost; }
    buy.addEventListener('click', () => {
      if (buyUpgrade(state, u.key)) { audio.sfx('buy'); save(); renderPills(); renderSurface(); renderShop(); }
    });
    row.append(em, info, buy);
    list.appendChild(row);
  }
}

// ---------- 환생 ----------
function openPrestige() {
  const gain = prestigeGain(state);
  $('prestige-title').textContent = t('prestigeTitle');
  if (gain > 0) { $('prestige-body').textContent = t('prestigeBody', { gain }); $('prestige-yes').disabled = false; }
  else { $('prestige-body').textContent = t('prestigeNeed', { m: PRESTIGE_MIN_DEPTH }); $('prestige-yes').disabled = true; }
  openModal('prestige-modal');
}

// ---------- 도감 / 랭킹 / 기록 ----------
function renderCodex() {
  $('codex-title').textContent = t('codexTitle', { found: codexFound(state), total: codexTotal() });
  const grid = $('codex-grid'); grid.replaceChildren();
  const cells = [];
  for (const z of ZONES) for (const tr of z.treasures) cells.push({ key: tr.key, emoji: tr.emoji, name: t('t_' + tr.key) });
  for (const ev of EVENTS) cells.push({ key: ev.key, emoji: ev.emoji, name: t('c_' + ev.key) });
  for (const c of cells) {
    const found = !!state.codex[c.key];
    const el = document.createElement('div'); el.className = 'codex-cell' + (found ? '' : ' locked');
    el.textContent = found ? c.emoji : '❔';
    const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = found ? c.name : t('codexUnknown');
    el.appendChild(nm); grid.appendChild(el);
  }
}
async function renderRank() {
  const list = $('rank-list'); list.replaceChildren();
  const loading = document.createElement('div'); loading.className = 'center'; loading.textContent = t('loading'); list.appendChild(loading);
  const { players, offline } = await fb.fetchLeaderboard(20);
  list.replaceChildren();
  if (offline) { const d = document.createElement('div'); d.className = 'center'; d.textContent = t('rankOffline'); list.appendChild(d); }
  if (!players.length) { const d = document.createElement('div'); d.className = 'center'; d.textContent = t('rankEmpty'); list.appendChild(d); return; }
  const me = fb.getPlayer()?.nickname;
  players.forEach((p, i) => {
    const row = document.createElement('div'); row.className = 'rank-item' + (p.nickname === me ? ' me' : '');
    const num = document.createElement('div'); num.className = 'rank-num'; num.textContent = ['🥇', '🥈', '🥉'][i] || String(i + 1);
    const nm = document.createElement('div'); nm.className = 'rank-name'; nm.textContent = p.nickname;
    const val = document.createElement('div'); val.className = 'rank-val'; val.textContent = fmt(p.maxDepth) + 'm';
    row.append(num, nm, val); list.appendChild(row);
  });
}
function renderStats() {
  const box = $('stats-list'); box.replaceChildren();
  const rows = [['st_dives', fmt(state.dives)], ['st_deaths', fmt(state.deaths)], ['st_gold', fmt(state.totalGold)], ['st_prestige', fmt(state.prestiges)], ['st_max', fmt(state.maxDepth) + 'm']];
  for (const [k, v] of rows) {
    const r = document.createElement('div'); const a = document.createElement('span'); a.textContent = t(k); const b = document.createElement('b'); b.textContent = v; r.append(a, b); box.appendChild(r);
  }
}

// ---------- 오프라인 정산 ----------
function settleOffline() {
  if (state.dive) return;
  const r = collectOffline(state, Date.now());
  if (r.gold > 0) {
    $('result-emoji').textContent = '🛥️';
    $('result-title').textContent = t('offlineTitle');
    $('result-body').textContent = t('offlineBody', { h: r.hours.toFixed(1), gold: fmt(r.gold) });
    $('result-items').textContent = '';
    openModal('result-modal');
    audio.sfx('surface');
    save(); renderSurface();
  }
}

// ---------- 메인 루프 ----------
function loop(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000 || 0);
  lastFrame = now;
  if (state.dive && state.dive.phase !== 'event') {
    const out = tick(state, dt);
    if (state.dive) {
      renderHud();
      bg.setView({ depth: state.dive.depth, phase: state.dive.phase });
      audio.setDepthMood(state.dive.depth / MAX_DEPTH);
      if (state.dive.phase === 'ascend' && !$('ascend-btn').disabled) { $('ascend-btn').disabled = true; $('phase-text').textContent = t('ascending'); }
    }
    handleEvents(out);
  }
  bg.frame(dt, now);
  saveTimer += dt;
  if (saveTimer > 10) { saveTimer = 0; if (!state.dive) save(); }
  requestAnimationFrame(loop);
}

// ---------- 바인딩 ----------
function bind() {
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModals));
  $('result-close').addEventListener('click', () => { closeModals(); if (!state.dive) goSurface(); });
  $('dive-btn').addEventListener('click', beginDive);
  $('ascend-btn').addEventListener('click', () => { if (startAscent(state)) { $('ascend-btn').disabled = true; $('phase-text').textContent = t('ascending'); audio.sfx('buy'); } });
  $('shop-btn').addEventListener('click', () => { renderShop(); openModal('shop-modal'); });
  $('codex-btn').addEventListener('click', () => { renderCodex(); openModal('codex-modal'); });
  $('rank-btn').addEventListener('click', () => { openModal('rank-modal'); renderRank(); });
  $('stats-btn').addEventListener('click', () => { renderStats(); openModal('stats-modal'); });
  $('howto-btn').addEventListener('click', () => openModal('howto-modal'));
  $('prestige-btn').addEventListener('click', openPrestige);
  $('prestige-yes').addEventListener('click', () => {
    const gain = doPrestige(state);
    if (!gain) return;
    closeModals(); audio.sfx('prestige'); save();
    toast(t('prestigeDone', { n: state.prestiges + 1, pearls: state.pearls }), 2600);
    renderSurface();
  });
  $('music-btn').addEventListener('click', audio.toggle);
  audio.setOnChange(on => { $('music-btn').textContent = on ? '🔊' : '🔇'; });
  const firstTouch = () => { audio.init(); document.removeEventListener('pointerdown', firstTouch); };
  document.addEventListener('pointerdown', firstTouch);

  $('nickname-btn').addEventListener('click', async () => {
    const name = $('nickname-input').value.trim();
    $('nickname-error').textContent = t('errChecking');
    const err = await fb.registerNickname(name);
    if (err) { $('nickname-error').textContent = t(err); return; }
    $('nickname-error').textContent = '';
    goSurface();
  });
  $('nickname-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('nickname-btn').click(); });

  fb.setOnState(on => { $('conn-dot').classList.toggle('on', on); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) save();
    else { lastFrame = performance.now(); settleOffline(); }
  });
  window.addEventListener('pagehide', save);
}

function init() {
  initLanguage(); applyI18n();
  bg.init($('bg'));
  bind();
  fb.init();
  load();
  if (fb.getPlayer()?.nickname) { goSurface(); settleOffline(); }
  else show('nickname-screen');
  requestAnimationFrame(ts => { lastFrame = ts; loop(ts); });
}
init();
