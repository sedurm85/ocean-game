// Web Audio 프로시저럴 BGM + 효과음 (v2 신스 레시피 이식). 외부 파일 없음.
let ctx = null, enabled = localStorage.getItem('oceanMusicEnabled') !== 'false';
let melodyTimer = null, drone = null, onChange = () => {};

export function isEnabled() { return enabled; }
export function setOnChange(fn) { onChange = fn; }

export function init() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  if (enabled) startMusic();
  onChange(enabled);
}

function startMusic() {
  if (!ctx || !enabled) return;
  if (ctx.state === 'suspended') ctx.resume();
  if (!drone) playDrone();
  scheduleNote();
}
function stopMusic() {
  if (melodyTimer) { clearTimeout(melodyTimer); melodyTimer = null; }
  if (drone) {
    for (const o of [drone.osc1, drone.osc2]) { try { o.stop(); } catch (err) { /* 이미 정지된 노드 */ } o.disconnect(); }
    drone.gain.disconnect(); drone.filter.disconnect(); drone = null;
  }
  if (ctx) ctx.suspend();
}
export function toggle() {
  enabled = !enabled;
  localStorage.setItem('oceanMusicEnabled', String(enabled));
  onChange(enabled);
  if (!ctx) { init(); return; }
  if (enabled) startMusic(); else stopMusic();
}
function playDrone() {
  const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  o1.type = 'sine'; o1.frequency.value = 55; o2.type = 'sine'; o2.frequency.value = 110; o2.detune.value = 5;
  f.type = 'lowpass'; f.frequency.value = 400; g.gain.value = 0.15;
  o1.connect(g); o2.connect(g); g.connect(f); f.connect(ctx.destination);
  drone = { osc1: o1, osc2: o2, gain: g, filter: f }; o1.start(); o2.start();
}
function scheduleNote() {
  if (!enabled || !ctx) return;
  const notes = [261.63, 293.66, 329.63, 392.00, 440.00];
  tone(notes[Math.floor(Math.random() * notes.length)], ctx.currentTime, 2, 0.05);
  melodyTimer = setTimeout(scheduleNote, Math.random() * 3000 + 2000);
}
function tone(freq, time, dur, vol) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(vol, time + 0.5); g.gain.linearRampToValueAtTime(0, time + dur);
  o.connect(g); g.connect(ctx.destination);
  o.onended = () => { o.disconnect(); g.disconnect(); }; o.start(time); o.stop(time + dur);
}

// 수심에 따라 드론 필터를 닫아 "깊은 느낌" (0 = 수면, 1 = 최심부)
export function setDepthMood(ratio) {
  if (!drone) return;
  drone.filter.frequency.setTargetAtTime(400 - 300 * ratio, ctx.currentTime, 0.5);
}

export function sfx(type) {
  if (!ctx || !enabled) return;
  if (ctx.state === 'suspended') ctx.resume();
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.onended = () => { o.disconnect(); g.disconnect(); };
  const semis = (Math.random() * 6 - 3); // ±3 반음 랜덤
  const pitch = Math.pow(2, semis / 12);
  switch (type) {
    case 'find':
      o.type = 'sine'; o.frequency.setValueAtTime(523.25 * pitch, t); o.frequency.exponentialRampToValueAtTime(659.25 * pitch, t + 0.1);
      g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.1); o.start(t); o.stop(t + 0.1); break;
    case 'bigfind':
      tone(523.25, t, 0.3, 0.12); tone(659.25, t + 0.15, 0.3, 0.12); tone(783.99, t + 0.3, 0.5, 0.15); break;
    case 'hit':
      o.type = 'triangle'; o.frequency.setValueAtTime(130.81, t); o.frequency.exponentialRampToValueAtTime(65.41, t + 0.15);
      g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.15); o.start(t); o.stop(t + 0.15); break;
    case 'death':
      tone(392, t, 1, 0.1); tone(329.63, t + 0.5, 1, 0.1); tone(261.63, t + 1, 2, 0.1); break;
    case 'surface':
      tone(440, t, 0.15, 0.1); tone(554.37, t + 0.1, 0.15, 0.1); tone(659.25, t + 0.2, 0.15, 0.1); tone(880, t + 0.3, 0.4, 0.12); break;
    case 'warn':
      o.type = 'sawtooth'; o.frequency.setValueAtTime(200, t); o.frequency.linearRampToValueAtTime(100, t + 0.4);
      g.gain.setValueAtTime(0.08, t); g.gain.linearRampToValueAtTime(0, t + 0.5); o.start(t); o.stop(t + 0.5); break;
    case 'buy':
      o.type = 'square'; o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.08);
      g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.1); o.start(t); o.stop(t + 0.1); break;
    case 'heal':
      o.type = 'sine'; o.frequency.setValueAtTime(440, t); o.frequency.exponentialRampToValueAtTime(880, t + 0.2);
      g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.25); o.start(t); o.stop(t + 0.25); break;
    case 'prestige':
      [261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((f, i) => tone(f, t + i * 0.12, 0.6, 0.1)); break;
    default: break;
  }
}
