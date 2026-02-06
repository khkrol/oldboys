const HattrickFX = {
    // 1. Feestelijke Confetti (voor winst)
    win: function() {
        // Een 'cannon' explosie van confetti
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }, // Iets onder het midden
            colors: ['#3D7C3B', '#FFC200', '#FFFFFF'] // Hattrick kleuren!
        });
    },

    // 2. Highscore Vuurwerk (langdurig)
    highScore: function() {
        var duration = 3 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            // Vuurwerk van links en rechts
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    },

    // 3. Screen Shake (voor Game Over)
    shakeScreen: function() {
        const body = document.body;
        body.classList.add('shake-anim');
        
        // Verwijder de class na de animatie zodat hij opnieuw kan
        setTimeout(() => {
            body.classList.remove('shake-anim');
        }, 500);
    }
};