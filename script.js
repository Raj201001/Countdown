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

/* ========= Music toggle ========= */
toggleBtn.addEventListener("click", async () => {
  try{
    if (music.paused){
      await music.play();
      toggleBtn.querySelector(".btn__text").textContent = "Pause Music";
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

/* ===== Add more images? =====
Option A: add more <figure class="slide"><img src="..."></figure> in index.html.
Option B (JS-managed):
--------------------------------
const imageList = ["photo1.jpg","photo2.jpg","photo3.jpg","photo4.jpg"];
if (!gallery.querySelector(".slide")) {
  gallery.innerHTML = imageList.map((src,i)=>`
    <figure class="slide${i===0?' active alt':''}">
      <img src="${src}" alt="" ${i===0?'loading="eager"':'loading="lazy"'} decoding="async"/>
    </figure>
  `).join("");
}
const slides = Array.from(gallery.querySelectorAll(".slide"));
startShow();
--------------------------------
*/