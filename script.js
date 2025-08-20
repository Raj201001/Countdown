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

// Resize canvas + card rect cache
function resizeCanvas(){
  const w = window.innerWidth;
  const h = window.innerHeight;
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
  cardRect = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
}
window.addEventListener('resize', resizeCanvas);
setInterval(updateCardRect, 1000);

// Random helpers
function rand(a,b){ return a + Math.random()*(b-a); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }
function smoothstep(edge0, edge1, x){
  const t = clamp((x - edge0) / (edge1 - edge1 + (edge1-edge0)), 0, 1); // guard
  const tt = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return tt * tt * (3 - 2 * tt);
}
function smooth(edge0, edge1, x){
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// Palette (with slight jitter per particle)
const palette = [
  '#ff8fb1', // blush
  '#f06292', // raspberry
  '#ffc9de', // pale pink
  '#ffe7f0'  // ivory
];

// Offscreen sprite makers
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
  // base petal
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = Math.min(w,h);
  const x0 = w/2, y0 = h/2;
  ctx.ellipse(x0, y0, s*0.36, s*0.62, -0.45, 0, Math.PI*2);
  ctx.fill();
  // soft ridge highlight
  const g = ctx.createLinearGradient(x0 - s*0.2, y0 - s*0.3, x0 + s*0.2, y0 + s*0.3);
  g.addColorStop(0, 'rgba(255,255,255,0.25)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.08)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x0, y0, s*0.34, s*0.58, -0.45, 0, Math.PI*2);
  ctx.fill();
}

// Build sprite set (hearts fewer/smaller feel more tasteful)
const sprites = [];
(function buildSprites(){
  const baseSizes = [28, 34, 40];
  for (const c of palette){
    for (const s of baseSizes){
      sprites.push({ type:'petal', img: makeOffscreen(s, s, (x,w,h)=>drawPetal(x,w,h,c)), w:s, h:s });
    }
  }
  // Hearts (less frequent sizes)
  const heartSizes = [24, 30];
  for (const c of palette.slice(0,3)){
    for (const s of heartSizes){
      sprites.push({ type:'heart', img: makeOffscreen(s, s, (x,w,h)=>drawHeart(x,w,h,c)), w:s, h:s });
    }
  }
})();

// Depth layers
const LAYERS = [
  { name:'far',  scale: 0.75, speed: 0.8,  alpha: 0.55 },
  { name:'mid',  scale: 1.00, speed: 1.0,  alpha: 0.75 },
  { name:'near', scale: 1.25, speed: 1.2,  alpha: 0.90, blur: 0.7 }
];

// Particle factory (edge-based emitter + ambient rare spawn)
function spawnFromEdge(){
  const edge = Math.floor(Math.random()*4); // 0 top, 1 right, 2 bottom, 3 left
  let x, y, vx, vy;
  const margin = 40;
  switch(edge){
    case 0: // top → down
      x = rand(-margin, width+margin); y = -margin; vx = rand(-0.03,0.03); vy = rand(0.02,0.05);
      break;
    case 1: // right → left
      x = width+margin; y = rand(-margin, height+margin); vx = rand(-0.06,-0.02); vy = rand(-0.01,0.03);
      break;
    case 2: // bottom → up
      x = rand(-margin, width+margin); y = height+margin; vx = rand(-0.03,0.03); vy = rand(-0.05,-0.02);
      break;
    default: // left → right
      x = -margin; y = rand(-margin, height+margin); vx = rand(0.02,0.06); vy = rand(-0.01,0.03);
  }
  return { x, y, vx, vy };
}
function makeParticle(burst=false){
  const isMobile = window.innerWidth < 560;
  const type = Math.random() < 0.8 ? 'petal' : 'heart'; // 80/20
  const options = sprites.filter(s => s.type===type);
  const sprite = pick(options);

  const layer = pick(LAYERS);
  const baseScale = rand(0.85, 1.15) * layer.scale;
  const { x, y, vx, vy } = burst ? { x: width*0.5 + rand(-width*0.2,width*0.2), y: height+20, vx: rand(-0.04,0.04), vy: rand(-0.06,-0.03) }
                                 : spawnFromEdge();

  // “Breeze” (3 layered sines) + flutter (wobble/flip)
  return {
    sprite, layer,
    x, y, vx, vy,
    scale: baseScale,
    swayA1: rand(6,18),   swayW1: rand(0.0006, 0.0016),  phase1: rand(0,Math.PI*2),
    swayA2: rand(2,7),    swayW2: rand(0.0011, 0.0022),  phase2: rand(0,Math.PI*2),
    swayA3: rand(1,4),    swayW3: rand(0.0018, 0.0030),  phase3: rand(0,Math.PI*2),
    rot: rand(0,Math.PI*2), rotV: rand(-0.0012,0.0012),
    flutter: rand(0.6, 1.0), // wobble strength
    alpha: rand(0.75, 1.0) * layer.alpha
  };
}

// Build initial field
function initParticles(){
  particles = [];
  const isMobile = window.innerWidth < 560;
  const count = isMobile ? 12 : 20; // Subtle
  for (let i=0;i<count;i++){ particles.push(makeParticle(false)); }
}
function bloomParticles(n=8){
  for (let i=0;i<n;i++){ particles.push(makeParticle(true)); }
}

// Opacity modulation over the glass card (dim when crossing it)
function opacityOverCard(px, py, baseAlpha){
  if (!cardRect) return baseAlpha;

  const falloff = 24; // fade range around card edges
  const inner = cardRect;
  const outer = {
    left: inner.left - falloff,
    top: inner.top - falloff,
    right: inner.right + falloff,
    bottom: inner.bottom + falloff
  };

  if (px < outer.left || px > outer.right || py < outer.top || py > outer.bottom) {
    return baseAlpha;
  }

  const minAlpha = baseAlpha * 0.32;

  let distToEdge = 0;
  if (px < inner.left) distToEdge = inner.left - px;
  else if (px > inner.right) distToEdge = px - inner.right;
  if (py < inner.top) distToEdge = Math.max(distToEdge, inner.top - py);
  else if (py > inner.bottom) distToEdge = Math.max(distToEdge, py - inner.bottom);

  if (distToEdge === 0) return minAlpha;

  const t = smooth(0, falloff, distToEdge);
  return minAlpha + (baseAlpha - minAlpha) * t;
}

// Canvas sizing & start
function startFX(){
  resizeCanvas();
  updateCardRect();
  initParticles();
  if (!prefersReduced){
    requestAnimationFrame(loop);
  }
}
startFX();

// Main loop
function loop(ts){
  if (!running) return;
  if (!lastTs) lastTs = ts;
  const dt = ts - lastTs; // ms
  lastTs = ts;

  ctx.clearRect(0,0,width,height);

  for (let i=particles.length-1; i>=0; i--){
    const p = particles[i];

    // Layered breeze sway
    const sway = Math.sin(p.phase1 += p.swayW1*dt)*p.swayA1
               + Math.sin(p.phase2 += p.swayW2*dt)*p.swayA2
               + Math.sin(p.phase3 += p.swayW3*dt)*p.swayA3;

    // Positions
    p.x += (p.vx * p.layer.speed) * dt + (sway * dt/1000);
    p.y += (p.vy * p.layer.speed) * dt;

    // Rotation + flutter (scale wobble)
    p.rot += p.rotV * dt;
    const wob = Math.sin((p.phase1 + p.phase2)*0.5) * 0.12 * p.flutter; // -0.12..0.12
    const scaleX = p.scale * (1 + wob);
    const scaleY = p.scale * (1 - wob*0.6);

    // Recycle if out of view with margin
    const margin = 80;
    if (p.x < -margin || p.x > width + margin || p.y < -margin || p.y > height + margin){
      particles[i] = makeParticle(false);
      continue;
    }

    // Alpha modulation over card + slight lightness oscillation
    const baseAlpha = p.alpha * (0.9 + 0.1*Math.sin(p.phase2*0.7));
    const alpha = opacityOverCard(p.x, p.y, baseAlpha);

    // Draw
    const w = p.sprite.w * scaleX;
    const h = p.sprite.h * scaleY;

    ctx.save();
    ctx.globalAlpha = alpha;

    // tiny blur for near layer on occasional gusts (GPU filter; keep subtle)
    if (p.layer.blur && Math.abs(sway) > 10){
      ctx.filter = `blur(${p.layer.blur}px)`;
    } else {
      ctx.filter = 'none';
    }

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

// Handle DPR changes (zoom)
window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener?.('change', ()=>{
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  resizeCanvas();
});