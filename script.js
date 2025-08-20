// Target Date: 26th Nov 2025
const targetDate = new Date("Nov 26, 2025 00:00:00").getTime();
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const music = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("toggleMusic");

// Countdown logic
function updateCountdown() {
  const now = new Date().getTime();
    const diff = targetDate - now;

      if (diff <= 0) {
          daysEl.textContent = 0;
              hoursEl.textContent = 0;
                  minutesEl.textContent = 0;
                      secondsEl.textContent = 0;
                          return;
                            }

                              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                                      daysEl.textContent = days;
                                        hoursEl.textContent = hours;
                                          minutesEl.textContent = minutes;
                                            secondsEl.textContent = seconds;
                                            }

                                            // Run immediately and then every second
                                            updateCountdown();
                                            setInterval(updateCountdown, 1000);

                                            // Music toggle
                                            toggleBtn.addEventListener("click", () => {
                                              if (music.paused) {
                                                  music.play();
                                                      toggleBtn.textContent = "⏸️ Pause Music";
                                                        } else {
                                                            music.pause();
                                                                toggleBtn.textContent = "🎵 Play Music";
                                                                  }
                                                                  });