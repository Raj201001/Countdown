// ===== Config =====
// Local device midnight for Nov 26, 2025.
// To force exact 00:00 IST regardless of device timezone, use:
// const TARGET = new Date("2025-11-25T18:30:00Z").getTime();
const TARGET = new Date("2025-11-26T00:00:00").getTime();
const TICK_MS = 25; // smooth & battery-friendly

// ===== Elements =====
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

// Start automatically
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