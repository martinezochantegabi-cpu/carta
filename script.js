/* ========== PERSONALIZA AQUÍ ========== */
const CONFIG = {
  titulo: "¡META!",
  para: "Para ti, campeón",
  mensaje: "Cada curva es mejor cuando la corremos juntos. Gracias por ser mi piloto favorito. ¡Este detalle es para ti!",
  firma: "Con cariño",
  foto: "",   // opcional, por ejemplo: "img/foto.jpg"
  pasos: 6    // clics en "Acelerar" para llegar a la meta
};
/* ====================================== */

const $ = s => document.querySelector(s);
const track = $('#track'), car = $('#car'), card = $('.card');
const fill = $('#fill'), pct = $('#pct'), win = $('#win');
const len = track.getTotalLength();
let pos = 0, target = 0, raf = 0, done = false;

// Estrellas del cielo
for (let i = 0; i < 45; i++) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', Math.random() * 1000);
  c.setAttribute('cy', Math.random() * 230);
  c.setAttribute('r', Math.random() * 1.6 + 0.4);
  c.setAttribute('fill', '#fff');
  c.style.animation = `twinkle ${2 + Math.random() * 3}s ${Math.random() * 3}s infinite`;
  $('#stars').appendChild(c);
}

// Coloca el carrito sobre la pista, inclinado según la curva
function place(p) {
  const d = p * len;
  const a = track.getPointAtLength(Math.max(0, d - 4));
  const b = track.getPointAtLength(Math.min(len, d + 4));
  const m = track.getPointAtLength(d);
  const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  car.setAttribute('transform', `translate(${m.x} ${m.y}) rotate(${ang}) translate(0 -15)`);
  fill.style.width = p * 100 + '%';
  pct.textContent = Math.round(p * 100) + '%';
}

// Movimiento suave hacia el objetivo
function tick() {
  const diff = target - pos;
  let step = diff * 0.06;
  const min = 0.0012 * Math.sign(diff);
  if (Math.abs(step) < Math.abs(min)) step = min;
  if (Math.abs(diff) <= Math.abs(step)) pos = target; else pos += step;
  place(pos);
  if (pos === target) {
    card.classList.remove('moving', 'turbo');
    raf = 0;
    if (pos >= 1) finish();
    return;
  }
  raf = requestAnimationFrame(tick);
}

function move(delta, turbo) {
  if (done) return;
  target = Math.min(1, Math.max(0, target + delta));
  card.classList.add('moving');
  card.classList.toggle('turbo', !!turbo);
  if (!raf) raf = requestAnimationFrame(tick);
}

// Mensaje final
function finish() {
  done = true;
  setTimeout(() => {
    const t = $('#wt');
    t.setAttribute('aria-label', CONFIG.titulo);
    t.innerHTML = [...CONFIG.titulo]
      .map((ch, i) => ch === ' ' ? '<span class="sp"></span>' : `<span style="--i:${i}" aria-hidden="true">${ch}</span>`)
      .join('');
    $('#wp').textContent = CONFIG.para;
    $('#wm').textContent = CONFIG.mensaje;
    $('#ws').textContent = CONFIG.firma;
    $('#wf').innerHTML = CONFIG.foto ? `<img class="foto" src="${CONFIG.foto}" alt="">` : '';
    win.hidden = false;
    confetti();
  }, 600);
}

function reset() {
  cancelAnimationFrame(raf);
  raf = 0;
  done = false;
  pos = target = 0;
  win.hidden = true;
  card.classList.remove('moving', 'turbo');
  stopConfetti();
  place(0);
}

// Confeti
const cv = $('#confetti'), cx = cv.getContext('2d');
let cRaf = 0;
function stopConfetti() {
  cancelAnimationFrame(cRaf);
  cx.clearRect(0, 0, cv.width, cv.height);
}
function confetti() {
  cv.width = card.clientWidth;
  cv.height = card.clientHeight;
  const cols = ['#ff6a13', '#ffc72c', '#1e63ff', '#e52b1f', '#ffffff'];
  const bits = Array.from({ length: 160 }, () => ({
    x: Math.random() * cv.width, y: -Math.random() * cv.height * 0.6,
    w: 6 + Math.random() * 7, h: 10 + Math.random() * 8,
    vx: -1 + Math.random() * 2, vy: 2 + Math.random() * 3.5,
    r: Math.random() * 6, vr: -0.2 + Math.random() * 0.4,
    c: cols[Math.floor(Math.random() * cols.length)]
  }));
  cancelAnimationFrame(cRaf);
  const t0 = performance.now();
  (function loop(t) {
    cx.clearRect(0, 0, cv.width, cv.height);
    for (const b of bits) {
      b.x += b.vx; b.y += b.vy; b.r += b.vr;
      if (b.y > cv.height + 20 && t - t0 < 5000) { b.y = -20; b.x = Math.random() * cv.width; }
      cx.save();
      cx.translate(b.x, b.y);
      cx.rotate(b.r);
      cx.fillStyle = b.c;
      cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      cx.restore();
    }
    if (t - t0 < 7000) cRaf = requestAnimationFrame(loop); else cx.clearRect(0, 0, cv.width, cv.height);
  })(t0);
}

// Controles
const paso = 1 / CONFIG.pasos;
const actions = {
  go: () => move(paso),
  turbo: () => move(paso * 2.5, true),
  back: () => move(-paso),
  reset
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-a]');
  if (a) actions[a.dataset.a]();
});
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'arrowright') actions.go();
  else if (k === 'arrowleft') actions.back();
  else if (k === 't') actions.turbo();
  else if (k === 'r') reset();
});

place(0);
