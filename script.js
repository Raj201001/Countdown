// ======================
// Config
// ======================

// Use local device time for 26 Nov 2025, 00:00:00 (device timezone-safe)
const TARGET = new Date("2025-11-26T00:00:00").getTime();

// Update frequency (ms). 25ms is smooth + battery friendly.
const TICK_MS = 25;

// ======================
// Elements
// ======================
const elDays   = document.getElementById("days");
const elHours  = document.getElementById("hours");
const elMins   = document.getElementById("minutes");
const elSecs   = document.getElementById("seconds");
const elMillis = document.getElementById("millis");

const music = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("toggleMusic");

// ======================
// Countdown
// ======================
let timerId = null;

function render(diffMs) {
  if (diffMs <= 0) {
    elDays.textContent   = "0";
    elHours.textContent  = "00";
    elMins.textContent   = "00";
    elSecs.textContent   = "00";
    elMillis.textContent = "000";
    clearInterval(timerId);
    return;
  }

  const days = Math.floor(diffMs / 86_400_000); // 1000*60*60*24
  const remDay = diffMs % 86_400_000;

  const hours = Math.floor(remDay / 3_600_000);
  const remHr = remDay % 3_600_000;

  const mins = Math.floor(remHr / 60_000);
  const remMin = remHr % 60_000;

  const secs = Math.floor(remMin / 1_000);
  const millis = Math.floor(remMin % 1_000);

  elDays.textContent   = String(days);
  elHours.textContent  = String(hours).padStart(2, "0");
  elMins.textContent   = String(mins).padStart(2, "0");
  elSecs.textContent   = String(secs).padStart(2, "0");
  elMillis.textContent = String(millis).padStart(3, "0");
}

function tick() {
  const now = Date.now();
  render(TARGET - now);
}

// Start automatically on page load
timerId = setInterval(tick, TICK_MS);
tick(); // immediate first paint

// ======================
// Music Toggle (play/pause on user tap)
// ======================
toggleBtn.addEventListener("click", async () => {
  try {
    if (music.paused) {
      await music.play();            // user gesture → allowed
      toggleBtn.textContent = "⏸ Pause Music";
    } else {
      music.pause();
      toggleBtn.textContent = "🎵 Play Music";
    }
  } catch (err) {
    // In case of any browser restriction
    console.log("Music play blocked:", err);
    toggleBtn.textContent = "🎵 Play Music";
  }
});