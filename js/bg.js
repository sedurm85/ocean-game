// 캔버스 배경 연출만 담당: 존 그라디언트, 수면 파도, 버블, 잠수부, 발견 파티클. 게임 로직 없음.
import { ZONES, MAX_DEPTH } from './data.js';

let canvas, ctx, w = 0, h = 0, dpr = 1;
let bubbles = [], particles = [];
let view = { depth: 0, phase: 'surface', diverX: 0.5 }; // phase: surface | descend | ascend | event
let gradCache = { key: '', grad: null };

function hexToRgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }
function rgb(c) { return `rgb(${c[0]},${c[1]},${c[2]})`; }

export function init(el) {
  canvas = el; ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 40; i++) bubbles.push(newBubble(true));
}
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth; h = window.innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  gradCache.key = '';
}
function newBubble(anywhere) {
  return { x: Math.random() * w, y: anywhere ? Math.random() * h : h + 10, r: 1.5 + Math.random() * 4, v: 30 + Math.random() * 60, wob: Math.random() * Math.PI * 2 };
}

export function setView(v) { Object.assign(view, v); }

export function burst(n, color) {
  const cx = w * view.diverX, cy = h * 0.5;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = 80 + Math.random() * 220;
    particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6, color });
  }
}

// 수심에 따라 현재 존과 다음 존 색을 섞는다
function zoneColors(depth) {
  let zi = 0;
  for (let i = 0; i < ZONES.length; i++) if (depth >= ZONES[i].from) zi = i;
  const z = ZONES[zi], zn = ZONES[Math.min(ZONES.length - 1, zi + 1)];
  const t = Math.min(1, Math.max(0, (depth - z.from) / (z.to - z.from)));
  const top = mix(hexToRgb(z.bg[0]), hexToRgb(zn.bg[0]), t * 0.6);
  const bot = mix(hexToRgb(z.bg[1]), hexToRgb(zn.bg[1]), t * 0.6);
  return { top, bot, zone: z };
}

export function frame(dt, time) {
  if (!ctx) return;
  const depth = view.depth;
  const { top, bot, zone } = zoneColors(depth);
  const key = top.join() + bot.join() + h;
  if (gradCache.key !== key) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot));
    gradCache = { key, grad: g };
  }
  ctx.fillStyle = gradCache.grad; ctx.fillRect(0, 0, w, h);

  // 햇살 (얕은 곳만)
  const sun = Math.max(0, 1 - depth / 200);
  if (sun > 0) {
    ctx.save(); ctx.globalAlpha = 0.08 * sun;
    for (let i = 0; i < 4; i++) {
      const x = w * (0.15 + i * 0.25) + Math.sin(time * 0.0004 + i) * 30;
      ctx.beginPath(); ctx.moveTo(x - 30, 0); ctx.lineTo(x + 30, 0); ctx.lineTo(x + 120, h); ctx.lineTo(x - 60, h); ctx.closePath();
      ctx.fillStyle = '#fff'; ctx.fill();
    }
    ctx.restore();
  }
  // 수면 파도 (수면 근처)
  if (depth < 40) {
    const y0 = 70 - depth * 1.5;
    ctx.save(); ctx.globalAlpha = 0.5 * (1 - depth / 40);
    for (let l = 0; l < 2; l++) {
      ctx.beginPath(); ctx.moveTo(0, 0);
      for (let x = 0; x <= w; x += 8) ctx.lineTo(x, y0 + l * 10 + Math.sin(x * 0.03 + time * 0.002 + l) * 6);
      ctx.lineTo(w, 0); ctx.closePath();
      ctx.fillStyle = l ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.4)'; ctx.fill();
    }
    ctx.restore();
  }
  // 해초/바닥 장식 (존 색)
  ctx.save(); ctx.globalAlpha = 0.7;
  ctx.fillStyle = zone.floor; ctx.fillRect(0, h - 26, w, 26);
  ctx.strokeStyle = zone.weed; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const x = (w / 7) * i + 20, sway = Math.sin(time * 0.0015 + i) * 10;
    ctx.beginPath(); ctx.moveTo(x, h - 20); ctx.quadraticCurveTo(x + sway, h - 60, x + sway * 1.5, h - 95); ctx.stroke();
  }
  ctx.restore();

  // 버블: 하강 중엔 빠르게 위로, 상승 중엔 천천히
  const speedMul = view.phase === 'descend' ? 2.2 : view.phase === 'ascend' ? 0.6 : 1;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (const b of bubbles) {
    b.y -= b.v * speedMul * dt; b.wob += dt * 2;
    const x = b.x + Math.sin(b.wob) * 6;
    if (b.y < -10) Object.assign(b, newBubble(false));
    ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  }
  // 잠수부
  const dy = view.phase === 'surface' ? h * 0.22 : h * 0.5 + Math.sin(time * 0.003) * 6;
  ctx.font = '48px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.save();
  ctx.translate(w * view.diverX, dy);
  if (view.phase === 'ascend') ctx.scale(1, -1);
  ctx.fillText('🤿', 0, 0);
  ctx.restore();
  // 파티클
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt; if (p.life <= 0) { particles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt;
    ctx.globalAlpha = Math.max(0, p.life / 0.6);
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // 깊어질수록 어두운 비네트
  const dark = Math.min(0.55, depth / MAX_DEPTH * 0.7);
  if (dark > 0.02) {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.8);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${dark})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
}
