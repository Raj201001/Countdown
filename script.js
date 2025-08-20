// Set your target date here
const targetDate = new Date("2025-12-31T23:59:59").getTime();

function updateCountdown() {
  const now = new Date().getTime();
    const distance = targetDate - now;

      if (distance < 0) {
          document.getElementById("countdown").innerHTML = "🎉 The event has started!";
              clearInterval(countdownTimer);
                  return;
                    }

                      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                              document.getElementById("days").textContent = days.toString().padStart(2, "0");
                                document.getElementById("hours").textContent = hours.toString().padStart(2, "0");
                                  document.getElementById("minutes").textContent = minutes.toString().padStart(2, "0");
                                    document.getElementById("seconds").textContent = seconds.toString().padStart(2, "0");
                                    }

                                    // Start countdown automatically when page loads
                                    const countdownTimer = setInterval(updateCountdown, 1000);
                                    updateCountdown(); // run immediately on load

                                    // Music toggle button
                                    const music = document.getElementById("bgMusic");
                                    const musicToggle = document.getElementById("musicToggle");

                                    musicToggle.addEventListener("click", () => {
                                      if (music.paused) {
                                          music.play();
                                              musicToggle.textContent = "⏸ Pause Music";
                                                } else {
                                                    music.pause();
                                                        musicToggle.textContent = "▶ Play Music";
                                                          }
                                                          });