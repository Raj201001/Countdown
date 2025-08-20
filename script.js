function updateCountdown() {
      const targetDate = new Date("Nov 26, 2025 00:00:00").getTime();
        const now = new Date().getTime();
          const diff = targetDate - now;

            if (diff <= 0) {
                document.getElementById("countdown").innerHTML = "🎉 The day is here!";
                    return;
                      }

                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                                const milliseconds = Math.floor(diff % 1000);

                                  document.getElementById("days").innerText = days;
                                    document.getElementById("hours").innerText = hours;
                                      document.getElementById("minutes").innerText = minutes;
                                        document.getElementById("seconds").innerText = seconds;
                                          document.getElementById("milliseconds").innerText = milliseconds;
                                          }

                                          setInterval(updateCountdown, 1);
}