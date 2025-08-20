/* ========= Countdown (with ms) ========= */
// Local device midnight for Nov 26, 2025.
// To force exact 00:00 IST regardless of device timezone, use:
// const TARGET = new Date("2025-11-25T18:30:00Z").getTime();
const TARGET = new Date("2025-11-26T00:00:00").getTime();
const TICK_MS = 25;

const elDays   = document.getElementById("days");
const elHours  = document.getElementById("hours");
const elMins   = document.getElementById("minutes");
const elSecs   = document.getElementById("seconds");
const elMillis = document.getElementById("millis");

const music     = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("toggleMusic");

let prev = { d:null, h:null, m:null, s:null, ms:null };
let timerId = null;

function setNum(el, value, key){
  if (prev[key] !== value){
    el.textContent = value;
    el.classList.remove("pop");
    void el.offsetWidth; // restart CSS animation
    el.classList.add("pop");
    prev[key] = value;
  }
}
function render(diffMs){
  if (diffMs <= 0){
    setNum(elDays,   "0",   "d");
    setNum(elHours,  "00",  "h");
    setNum(elMins,   "00",  "m");
    setNum(elSecs,   "00",  "s");
    setNum(elMillis, "000", "ms");
    clearInterval(timerId);
    return;
  }
  const day=86_400_000, hr=3_600_000, min=60_000, sec=1_000;
  const days  = Math.floor(diffMs / day);
  const hRem  = diffMs % day;
  const hours = Math.floor(hRem / hr);
  const mRem  = hRem % hr;
  const mins  = Math.floor(mRem / min);
  const sRem  = mRem % min;
  const secs  = Math.floor(sRem / sec);
  const ms    = Math.floor(sRem % sec);

  setNum(elDays,   String(days),                 "d");
  setNum(elHours,  String(hours).padStart(2,"0"),"h");
  setNum(elMins,   String(mins).padStart(2,"0"), "m");
  setNum(elSecs,   String(secs).padStart(2,"0"), "s");
  setNum(elMillis, String(ms).padStart(3,"0"),   "ms");
}

function tick(){ render(TARGET - Date.now()); }
timerId = setInterval(tick, TICK_MS);
tick();

/* ========= Music toggle (+ subtle bloom) ========= */
toggleBtn.addEventListener("click", async () => {
  try{
    if (music.paused){
      await music.play();
      toggleBtn.querySelector(".btn__text").textContent = "Pause Music";
      bloomParticles(8); // tiny celebratory bloom
    }else{
      music.pause();
      toggleBtn.querySelector(".btn__text").textContent = "Play Music";
    }
  }catch(err){
    console.log("Music play blocked:", err);
  }
});

/* ========= Ken Burns Crossfade Slideshow (below the card) ========= */
const gallery = document.getElementById("gallery");
const slides  = Array.from(gallery.querySelectorAll(".slide"));

let idx = 0;
const FADE_MS    = 1600;  // matches CSS transition
const DISPLAY_MS = 6000;  // time fully visible before switching
let playTimer    = null;
let playing      = false;

function activate(nextIndex){
  slides[idx].classList.remove("active");
  idx = (typeof nextIndex === "number") ? nextIndex : (idx + 1) % slides.length;
  // Alternate pan direction for variety
  slides[idx].classList.toggle("alt", idx % 2 === 1);
  slides[idx].classList.add("active");
}

function scheduleNext(){
  playTimer = setTimeout(() => {
    if (!gallery.classList.contains("paused")) {
      activate();
    }
    scheduleNext(); // chain again
  }, DISPLAY_MS);
}

function startShow(){
  if (!slides.length || playing) return;
  if (!slides.some(s => s.classList.contains("active"))) {
    slides[0].classList.add("active");
  }
  playing = true;
  scheduleNext();
}
function stopShow(){
  playing = false;
  clearTimeout(playTimer);
}

// Pause on hover (desktop)
gallery.addEventListener("mouseenter", () => gallery.classList.add("paused"));
gallery.addEventListener("mouseleave", () => gallery.classList.remove("paused"));

// Pause on touch hold (mobile)
let touchTimer = null;
gallery.addEventListener("touchstart", () => {
  gallery.classList.add("paused");
  clearTimeout(touchTimer);
}, { passive:true });
gallery.addEventListener("touchend", () => {
  clearTimeout(touchTimer);
  touchTimer = setTimeout(() => gallery.classList.remove("paused"), 250);
}, { passive:true });

// Pause when tab is hidden (saves battery, prevents jump)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopShow(); else startShow();
});

// Kick off slideshow
startShow();

/* ========= Flying hearts & petals (canvas) ========= */
const fxCanvas = document.getElementById("petalsCanvas");
const ctx = fxCanvas.getContext("2d", { alpha: true });
let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap DPR for perf
let width = 0, height = 0;
let particles = [];
let running = true;
let lastTs = 0;
let cardRect = null;

// Respect reduced motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  running = false;
  fxCanvas.style.display = 'none';
}

// Resize canvas
function resizeCanvas(){
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w === width && h === height) return;
  width = w; height = h;
  fxCanvas.width = Math.floor(width * dpr);
  fxCanvas.height = Math.floor(height * dpr);
  fxCanvas.style.width = width + 'px';
  fxCanvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  updateCardRect();
}
function updateCardRect(){
  const card = document.getElementById('glassCard');
  const r = card.getBoundingClientRect();
  // store as plain object
  cardRect = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
}

window.addEventListener('resize', () => {
  resizeCanvas();
});
setInterval(updateCardRect, 1000); // refresh approx every second

// Helpers
function rand(a,b){ return a + Math.random()*(b-a); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }
function smoothstep(edge0, edge1, x){
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// Pre-render sprites (hearts + petals) to offscreen canvases
const palette = [
  '#ff8fb1', // blush
  '#f06292', // raspberry
  '#ffc9de', // pale pink
  '#ffe7f0'  // ivory
];

function makeOffscreen(w,h, draw){
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  draw(x, w, h);
  return c;
}
function drawHeart(ctx, w, h, color){
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = color;
  ctx.beginPath();
  // parametric heart shape
  const s = Math.min(w,h);
  const x0 = w/2, y0 = h/2 + s*0.06;
  ctx.moveTo(x0, y0);
  ctx.bezierCurveTo(x0+s*0.5, y0-s*0.35, x0+s*0.55, y0+s*0.2, x0, y0+s*0.45);
  ctx.bezierCurveTo(x0-s*0.55, y0+s*0.2, x0-s*0.5, y0-s*0.35, x0, y0);
  ctx.closePath();
  ctx.fill();
}
function drawPetal(ctx, w, h, color){
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = Math.min(w,h);
  const x0 = w/2, y0 = h/2;
  ctx.ellipse(x0, y0, s*0.35, s*0.6, -0.5, 0, Math.PI*2);
  ctx.fill();

  // add gentle gradient highlight
  const g = ctx.createRadialGradient(x0 - s*0.1, y0 - s*0.2, 0, x0, y0, s*0.8);
  g.addColorStop(0, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x0, y0, s*0.35, s*0.6, -0.5, 0, Math.PI*2);
  ctx.fill();
}

const sprites = [];
(function buildSprites(){
  const baseSizes = [28, 34, 40]; // base sprite size (then scaled)
  for (const c of palette){
    for (const s of baseSizes){
      sprites.push({ type:'heart',  img: makeOffscreen(s, s, (x,w,h)=>drawHeart(x,w,h,c)),  w:s, h:s });
      sprites.push({ type:'petal',  img: makeOffscreen(s, s, (x,w,h)=>drawPetal(x,w,h,c)),  w:s, h:s });
    }
  }
})();

// Particle factory
function makeParticle(bottomSpawn=false){
  const isMobile = window.innerWidth < 560;
  const subtleCount = isMobile ? 12 : 20; // we’ll use only ~this many total
  // type mix ~70% petals, 30% hearts
  const type = Math.random() < 0.7 ? 'petal' : 'heart';
  const matches = sprites.filter(s => s.type === type);
  const sprite = pick(matches);

  const size = rand(0.75, 1.25); // scale multiplier
  const x = bottomSpawn ? (width*0.5 + rand(-width*0.1, width*0.1)) : rand(0, width);
  const y = bottomSpawn ? (height + rand(10, 60)) : rand(-60, height*0.2);

  return {
    sprite,
    x, y,
    scale: size,
    vy: rand(14, 24) / 100,        // vertical drift (px/ms)
    swayA: rand(8, 22),            // sway amplitude (px)
    swayW: rand(0.001, 0.0022),    // sway angular speed
    swayT: rand(0, Math.PI*2),     // sway phase
    rot: rand(0, Math.PI*2),       // rotation
    rotV: rand(-0.0012, 0.0012),   // rotation speed
    alpha: rand(0.65, 0.95),       // base alpha
  };
}

// Build initial particle field
function initParticles(){
  particles = [];
  const isMobile = window.innerWidth < 560;
  const count = isMobile ? 12 : 20; // Subtle density
  for (let i=0;i<count;i++){
    particles.push(makeParticle(false));
  }
}
function bloomParticles(n=8){
  for (let i=0;i<n;i++){
    particles.push(makeParticle(true));
  }
}

// Opacity modulation over the glass card
// We’ll dim when particle is inside/near the card rect with smooth transition
function opacityOverCard(px, py, baseAlpha){
  if (!cardRect) return baseAlpha;

  const falloff = 22; // fade range around the card edges
  const inner = cardRect;
  const outer = {
    left: inner.left - falloff,
    top: inner.top - falloff,
    right: inner.right + falloff,
    bottom: inner.bottom + falloff
  };

  // Outside outer → no dim
  if (px < outer.left || px > outer.right || py < outer.top || py > outer.bottom) {
    return baseAlpha;
  }

  // Inside inner → minimum alpha
  const minAlpha = baseAlpha * 0.32;

  // In the band between inner and outer → smooth ramp
  let distToEdge = 0;
  if (px < inner.left) distToEdge = inner.left - px;
  else if (px > inner.right) distToEdge = px - inner.right;
  if (py < inner.top) distToEdge = Math.max(distToEdge, inner.top - py);
  else if (py > inner.bottom) distToEdge = Math.max(distToEdge, py - inner.bottom);

  // If truly inside (distToEdge == 0), return min
  if (distToEdge === 0) return minAlpha;

  // Map 0..falloff → minAlpha..baseAlpha
  const t = smoothstep(0, falloff, distToEdge);
  return minAlpha + (baseAlpha - minAlpha) * t;
}

// Animation loop
function loop(ts){
  if (!running){ return; }
  if (!lastTs) lastTs = ts;
  const dt = ts - lastTs;
  lastTs = ts;

  ctx.clearRect(0,0,width,height);

  // draw each particle
  for (let i=particles.length-1; i>=0; i--){
    const p = particles[i];

    // update
    p.swayT += p.swayW * dt;
    p.x += Math.sin(p.swayT) * (p.swayA * dt/1000);
    p.y += -p.vy * dt; // move upward (negative y)

    p.rot += p.rotV * dt;

    // recycle if out of view
    if (p.y < -80){
      // replace with new particle from bottom or top
      particles[i] = makeParticle(true);
      continue;
    }

    // draw
    const w = p.sprite.w * p.scale;
    const h = p.sprite.h * p.scale;

    // Compute alpha modulation over card
    const alpha = opacityOverCard(p.x, p.y, p.alpha);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.drawImage(p.sprite.img, -w/2, -h/2, w, h);
    ctx.restore();
  }

  requestAnimationFrame(loop);
}

// Visibility pause
document.addEventListener('visibilitychange', () => {
  if (document.hidden){
    running = false;
  } else {
    running = !prefersReduced;
    lastTs = 0;
    requestAnimationFrame(loop);
  }
});

// Init
resizeCanvas();
initParticles();
updateCardRect();
if (!prefersReduced){
  requestAnimationFrame(loop);
}