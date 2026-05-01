document.addEventListener("DOMContentLoaded", () => {
    
    // 1. URL Parameter Parsing (Guest Name dynamically from Google Sheets)
    const searchParams = new URLSearchParams(window.location.search);
    const guestParam = searchParams.get('to'); // Could be name or ID
    const guestId = searchParams.get('id'); // Explicit ID if passed
    
    const guestNameEl = document.getElementById('guest-name');
    
    // Default placeholder
    if (guestParam || guestId) {
        guestNameEl.innerText = "Memuat nama...";
    }
    
    // Google Sheets CSV Export URL
    const csvUrl = "https://docs.google.com/spreadsheets/d/1vTX5m95difarIQfDsJJ7yjcloHujK-2zIZdnZ5gge3E/export?format=csv&gid=0";
    
    if (typeof Papa !== 'undefined') {
        Papa.parse(csvUrl, {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data;
                let foundName = null;
                
                // Search in data
                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    if ((guestId && row['Uniq Id'] === guestId) || 
                        (guestParam && row['Uniq Id'] === guestParam) ||
                        (guestParam && row['Nama'] === guestParam)) {
                        foundName = row['Nama'];
                        break;
                    }
                }
                
                if (foundName) {
                    guestNameEl.innerText = foundName;
                } else if (guestParam) {
                    guestNameEl.innerText = guestParam.replace(/\+/g, ' ');
                } else {
                    guestNameEl.innerText = "Tamu Undangan";
                }
            },
            error: function(err) {
                console.error("Failed to fetch guest list:", err);
                guestNameEl.innerText = guestParam ? guestParam.replace(/\+/g, ' ') : "Tamu Undangan";
            }
        });
    } else {
        console.warn("PapaParse not found. Check your script imports.");
        guestNameEl.innerText = guestParam ? guestParam.replace(/\+/g, ' ') : "Tamu Undangan";
    }

    // 2. Prevent scroll when cover is active
    document.body.classList.add('no-scroll');

    // 3. Open Invitation Logic
    const btnOpen = document.getElementById('open-invitation');
    const cover = document.getElementById('welcome-cover');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    let isPlaying = false;

    btnOpen.addEventListener('click', () => {
        cover.classList.add('slide-up');
        setTimeout(() => {
            cover.style.display = 'none';
        }, 1000); // match transition duration

        mainContent.classList.remove('hidden-content');
        document.body.classList.remove('no-scroll');
        
        // Confetti Canvas (Maroon Colors)
        if(typeof confetti !== 'undefined') {
            var defaults = {
                spread: 180,
                ticks: 400,
                gravity: 0.6,
                decay: 0.92,
                startVelocity: 50,
                colors: ['#7A0A15', '#8B1A25', '#9B2430', '#6B050F', '#5D030C', '#A52A2A']
            };

            // First wave - Maroon circles
            confetti({
                ...defaults,
                particleCount: 200,
                scalar: 1.2
            });

            // Second wave
            setTimeout(() => {
                confetti({
                    ...defaults,
                    particleCount: 150,
                    scalar: 1
                });
            }, 200);

            // Third wave
            setTimeout(() => {
                confetti({
                    ...defaults,
                    particleCount: 100,
                    scalar: 0.8
                });
            }, 400);
        }
        
        // Play music
        bgMusic.play().then(() => {
            isPlaying = true;
            musicBtn.classList.remove('hidden');
        }).catch(err => {
            console.log("Autoplay prevented: ", err);
            musicBtn.classList.remove('hidden');
        });
    });

    // 4. Music Control
    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.innerHTML = '<i class="fas fa-music" style="opacity:0.5;"></i>';
            musicBtn.style.animation = 'none';
        } else {
            bgMusic.play();
            musicBtn.innerHTML = '<i class="fas fa-music"></i>';
            musicBtn.style.animation = 'pulse 2s infinite';
        }
        isPlaying = !isPlaying;
    });

    // 5. Countdown Timer
    // Setting Date: May 24, 2026 08:00:00
    const countDownDate = new Date("May 24, 2026 08:00:00").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        if (distance < 0) {
            document.getElementById("cd-days").innerHTML = "00";
            document.getElementById("cd-hours").innerHTML = "00";
            document.getElementById("cd-minutes").innerHTML = "00";
            document.getElementById("cd-seconds").innerHTML = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("cd-days").innerHTML = days < 10 ? '0' + days : days;
        document.getElementById("cd-hours").innerHTML = hours < 10 ? '0' + hours : hours;
        document.getElementById("cd-minutes").innerHTML = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById("cd-seconds").innerHTML = seconds < 10 ? '0' + seconds : seconds;
    };

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // 6. Init Swiper Slider (Gallery)
    const swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        speed: 800,
        coverflowEffect: {
            rotate: 8,
            stretch: 0,
            depth: 300,
            modifier: 1.2,
            slideShadows: false,
        },
        loop: true,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
        },
        keyboard: {
            enabled: true,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });

    // 7. Scroll Animation (AOS Replica using Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                observer.unobserve(entry.target); // Optional: only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });

    // 8. RSVP Form Submit Dummy
    const rsvpForm = document.getElementById('rsvp-form');
    if(rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rsvpBox = document.querySelector('.rsvp-box');
            // Ganti form dengan pesan sukses
            rsvpBox.innerHTML = '<h2 class="section-title">Terima Kasih!</h2><p style="text-align:center; font-size:1.1rem; margin-top:20px;">Konfirmasi kehadiran dan doa restu Anda telah berhasil kami terima. Kami sangat menantikan kehadiran Anda di hari bahagia kami.</p>';
        });
    }

    // 9. Falling Jasmine Logic
    const createFlower = () => {
        const flower = document.createElement('div');
        flower.classList.add('falling-flower');
        
        // Randomize size, position, duration
        const size = Math.random() * 15 + 10; // 10px to 25px
        flower.style.width = `${size}px`;
        flower.style.height = `${size}px`;
        flower.style.left = `${Math.random() * 95}vw`; // Keep it within 95vw to avoid scrollbars
        
        const duration = Math.random() * 5 + 5; // 5s to 10s
        flower.style.animationDuration = `${duration}s`;
        
        document.body.appendChild(flower);
        
        setTimeout(() => {
            flower.remove();
        }, duration * 1000);
    };
    
    // Generate new flower every 600ms
    setInterval(createFlower, 600);

});
