// Countdown
const targetDate = new Date("November 26, 2025 00:00:00").getTime();
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const msEl = document.getElementById("ms");

function updateCountdown() {
  const now = new Date().getTime();
    const distance = targetDate - now;

      if (distance < 0) {
          daysEl.textContent = "0";
              hoursEl.textContent = "0";
                  minutesEl.textContent = "0";
                      secondsEl.textContent = "0";
                          msEl.textContent = "0";
                              return;
                                }

                                  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                                        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                                          const ms = Math.floor(distance % 1000);

                                            daysEl.textContent = days;
                                              hoursEl.textContent = hours;
                                                minutesEl.textContent = minutes;
                                                  secondsEl.textContent = seconds;
                                                    msEl.textContent = ms;
                                                    }

                                                    // Update every 50ms
                                                    setInterval(updateCountdown, 50);

                                                    // Music toggle
                                                    const music = document.getElementById("bgMusic");
                                                    const musicBtn = document.getElementById("musicBtn");

                                                    let isPlaying = false;

                                                    musicBtn.addEventListener("click", () => {
                                                      if (isPlaying) {
                                                          music.pause();
                                                              musicBtn.textContent = "🎵 Play Music";
                                                                } else {
                                                                    music.play().catch(err => console.log("Autoplay blocked:", err));
                                                                        musicBtn.textContent = "⏸ Pause Music";
                                                                          }
                                                                            isPlaying = !isPlaying;
                                                                            });