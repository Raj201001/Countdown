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

                                          // Romantic Quotes Rotation
                                          const quotes = [
                                            "Every love story is beautiful, but ours is my favorite ❤️",
                                              "You are my today and all of my tomorrows 💕",
                                                "Together is my favorite place to be 💑",
                                                  "I still fall for you every single day 💘",
                                                    "In your arms is where I belong 🌸"
                                                    ];
                                                    let quoteIndex = 0;

                                                    function updateQuote() {
                                                      document.getElementById("quote").innerText = quotes[quoteIndex];
                                                        quoteIndex = (quoteIndex + 1) % quotes.length;
                                                        }
                                                        setInterval(updateQuote, 5000);

                                                        // Music Toggle
                                                        function toggleMusic() {
                                                          const music = document.getElementById("bg-music");
                                                            if (music.paused) {
                                                                music.play();
                                                                  } else {
                                                                      music.pause();
                                                                        }
                                                                        }
}