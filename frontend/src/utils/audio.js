let audioCtx;

const initAudio = () => {
    try {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } catch (e) {
        console.error("Audio init failed", e);
    }
};

// Listen for first interaction to unlock audio
if (typeof window !== 'undefined') {
    const unlockAudio = () => {
        initAudio();
        // Remove event listeners after unlocking
        ['click', 'touchstart', 'keydown'].forEach(event => {
            window.removeEventListener(event, unlockAudio);
        });
    };
    ['click', 'touchstart', 'keydown'].forEach(event => {
        window.addEventListener(event, unlockAudio, { once: true });
    });
}

export const playNotificationSound = () => {
    try {
        initAudio();
        if (!audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // A pleasant double-beep sound for notifications
        osc.type = 'sine';
        
        // First beep
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        
        // Second beep
        osc.frequency.setValueAtTime(1108.73, audioCtx.currentTime + 0.15); // C#6
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.15);
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.2);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
        console.error("Audio play failed", e);
    }
};
