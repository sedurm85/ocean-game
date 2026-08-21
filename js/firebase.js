// Firebase 익명 인증 + 닉네임 + 수심 리더보드. SDK가 없거나 네트워크가 없어도 게임은 돈다.
const PLAYER_KEY = 'oceanPlayer';
const PENDING_NICK = 'oceanPendingNickname';
const PENDING_DEPTH = 'oceanPendingDepth';
const LB_CACHE = 'oceanLeaderboardCacheV3';
const BAD_WORDS = ['시발', '씨발', '병신', '지랄', '좆', '섹스', 'fuck', 'shit', 'bitch', 'sex', 'porn', 'nazi'];

const firebaseConfig = {
  apiKey: 'AIzaSyDR-gQUAj57D0ychSZ6LMKAMgW307ltOSI',
  authDomain: 'ocean-game-370ac.firebaseapp.com',
  databaseURL: 'https://ocean-game-370ac-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'ocean-game-370ac',
  storageBucket: 'ocean-game-370ac.firebasestorage.app',
  messagingSenderId: '905935892280',
  appId: '1:905935892280:web:36827c782977ee41375bcd',
};

let db = null, auth = null, ready = false, player = null, onState = () => {};

function readJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch (err) { return fallback; }
}
function savePlayer() { localStorage.setItem(PLAYER_KEY, JSON.stringify(player)); }

export function getPlayer() { return player; }
export function isOnline() { return ready; }
export function setOnState(fn) { onState = fn; }

export function validateNickname(name) {
  if (name.length < 2 || name.length > 8) return 'errNicknameLength';
  if (!/^[a-zA-Z0-9가-힣]+$/.test(name)) return 'errNicknameInvalid';
  const low = name.toLowerCase();
  if (BAD_WORDS.some(w => low.includes(w))) return 'errNicknameBad';
  return null;
}

export function init() {
  player = readJSON(PLAYER_KEY, null);
  if (typeof firebase === 'undefined') { onState(false); return; }
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    auth = firebase.auth();
  } catch (err) { db = null; auth = null; onState(false); return; }
  db.ref('.info/connected').on('value', snap => {
    ready = !!snap.val() && !!auth.currentUser;
    onState(ready);
    if (ready) syncPending();
  });
  auth.onAuthStateChanged(user => {
    if (!user) return;
    ready = true; onState(true);
    if (player && !player.uid) { player.uid = user.uid; savePlayer(); }
    syncPending();
  });
  auth.signInAnonymously().catch(() => { ready = false; onState(false); });
}

// 닉네임 등록. 반환: 에러 키 또는 null. 오프라인이면 로컬 저장 후 나중에 동기화.
export async function registerNickname(name) {
  const err = validateNickname(name);
  if (err) return err;
  const low = name.toLowerCase();
  if (!ready || !auth?.currentUser) {
    player = { uid: null, nickname: name }; savePlayer();
    localStorage.setItem(PENDING_NICK, JSON.stringify({ nickname: name, low }));
    return null;
  }
  const uid = auth.currentUser.uid;
  try {
    const snap = await db.ref('nicknames/' + low).once('value');
    if (snap.exists() && snap.val().uid !== uid) return 'errNicknameTaken';
    const up = {};
    up['/players/' + uid] = { nickname: name, maxDepth: 0, highScore: 0, updatedAt: firebase.database.ServerValue.TIMESTAMP };
    up['/nicknames/' + low] = { uid };
    await db.ref().update(up);
    player = { uid, nickname: name }; savePlayer();
    localStorage.removeItem(PENDING_NICK);
    return null;
  } catch (e) {
    player = { uid: null, nickname: name }; savePlayer();
    localStorage.setItem(PENDING_NICK, JSON.stringify({ nickname: name, low }));
    return null;
  }
}

export function syncDepth(maxDepth) {
  const depth = Math.round(maxDepth);
  if (!ready || !player?.uid) { localStorage.setItem(PENDING_DEPTH, String(depth)); return; }
  db.ref('players/' + player.uid).update({ nickname: player.nickname, maxDepth: depth, updatedAt: firebase.database.ServerValue.TIMESTAMP })
    .then(() => { const p = Number(localStorage.getItem(PENDING_DEPTH)); if (p && p <= depth) localStorage.removeItem(PENDING_DEPTH); })
    .catch(() => localStorage.setItem(PENDING_DEPTH, String(depth)));
}

async function syncPending() {
  if (!ready || !auth?.currentUser) return;
  const uid = auth.currentUser.uid;
  if (player && !player.uid) { player.uid = uid; savePlayer(); }
  const pn = readJSON(PENDING_NICK, null);
  if (pn && pn.nickname) {
    try {
      const snap = await db.ref('nicknames/' + pn.low).once('value');
      if (!snap.exists() || snap.val().uid === uid) {
        const up = {};
        up['/players/' + uid] = { nickname: pn.nickname, maxDepth: 0, highScore: 0, updatedAt: firebase.database.ServerValue.TIMESTAMP };
        up['/nicknames/' + pn.low] = { uid };
        await db.ref().update(up);
        player = { uid, nickname: pn.nickname }; savePlayer();
        localStorage.removeItem(PENDING_NICK);
      } else {
        // 선점당함: 닉네임 뒤에 숫자를 붙여 자동 해결
        const alt = (pn.nickname.slice(0, 6) + Math.floor(10 + Math.random() * 90));
        localStorage.setItem(PENDING_NICK, JSON.stringify({ nickname: alt, low: alt.toLowerCase() }));
        player.nickname = alt; savePlayer();
      }
    } catch (e) { /* 다음 연결 때 재시도 */ }
  }
  const pd = Number(localStorage.getItem(PENDING_DEPTH));
  if (pd > 0) syncDepth(pd);
}

// 반환: { players:[{nickname,maxDepth}], offline:bool }
export async function fetchLeaderboard(limit = 20) {
  const cached = readJSON(LB_CACHE, []);
  if (!ready) return { players: cached.slice(0, limit), offline: true };
  try {
    const snap = await db.ref('players').orderByChild('maxDepth').limitToLast(limit).once('value');
    const list = [];
    snap.forEach(ch => { const v = ch.val(); if (v && typeof v.nickname === 'string' && typeof v.maxDepth === 'number') list.push({ nickname: v.nickname, maxDepth: v.maxDepth }); });
    list.reverse();
    localStorage.setItem(LB_CACHE, JSON.stringify(list));
    return { players: list, offline: false };
  } catch (e) {
    return { players: cached.slice(0, limit), offline: true };
  }
}
