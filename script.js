// ===== Config =====
// Local device midnight for Nov 26, 2025
// (If you want exactly 00:00 IST regardless of device timezone,
// use: new Date("2025-11-25T18:30:00Z").getTime())
const TARGET = new Date("2025-11-26T00:00:00").getTime();

// Smooth without draining battery
const TICK_MS = 25;

// ===== Elements =====
const elDays   = document.getElementById("days");
const elHours  = document.getElementById("hours");
const elMins   = document.getElementById("minutes");
const elSecs   = document.getElementById("seconds");
const elMillis = document.getElementById("millis");

const music    = document.getElementById("bgMusic");
const toggleBtn= document.getElementById("toggleMusic");

// Keep previous numbers to animate only when changed
let prev = { d:null, h:null, m:null, s:null, ms:null };
let timerId = null;

function setNum(el, value, key){
  if (prev[key] !== value){
    el.textContent = value;
    // Pop animation
    el.classList.remove("pop");
    // Force reflow to restart animation reliably
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
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

  const dayMs = 86_400_000, hrMs = 3_600_000, minMs = 60_000, secMs = 1_000;

  const days   = Math.floor(diffMs / dayMs);
  const remDay = diffMs % dayMs;

  const hours  = Math.floor(remDay / hrMs);
  const remHr  = remDay % hrMs;

  const mins   = Math.floor(remHr / minMs);
  const remMin = remHr % minMs;

  const secs   = Math.floor(remMin / secMs);
  const millis = Math.floor(remMin % secMs);

  setNum(elDays,   String(days),                 "d");
  setNum(elHours,  String(hours).padStart(2,"0"),"h");
  setNum(elMins,   String(mins).padStart(2,"0"), "m");
  setNum(elSecs,   String(secs).padStart(2,"0"), "s");
  setNum(elMillis, String(millis).padStart(3,"0"),"ms");
}

function tick(){
  render(TARGET - Date.now());
}

// Start
timerId = setInterval(tick, TICK_MS);
tick();

// ===== Music toggle (requires user gesture) =====
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