// Web Audio API sound generator for Coffee & Break Bar

class CoffeeSoundPlayer {
    private ctx: AudioContext | null = null;
    public isMuted: boolean = false;

    constructor() {
        // Load mute preference from storage
        const savedMute = localStorage.getItem('task_manager_coffee_mute');
        this.isMuted = savedMute === 'true';
    }

    private getAudioContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        localStorage.setItem('task_manager_coffee_mute', String(this.isMuted));
        return this.isMuted;
    }

    // Play pleasant soft click
    public playClick() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch {
            // Ignore audio context errors
        }
    }

    // Play grinder & bean sound effect
    public playGrind() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            // Generate brown noise burst
            const bufferSize = ctx.sampleRate * 0.4;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + 0.02 * white) / 1.02;
                lastOut = data[i];
                data[i] *= 2.5; // boost
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(320, ctx.currentTime);
            filter.Q.setValueAtTime(3, ctx.currentTime);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start();
        } catch {
            // Ignore audio context errors
        }
    }

    // Play steam wand hiss
    public playSteam() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1800, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(2800, ctx.currentTime + 0.5);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.01, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start();
        } catch {
            // Ignore audio context errors
        }
    }

    // Ding chime when order is finished & served
    public playReadyChime() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            // Harmonic chime chords (E5, G#5, B5, E6)
            const freqs = [659.25, 830.61, 987.77, 1318.51];

            freqs.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                gain.gain.setValueAtTime(0.12, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 1.3);
            });
        } catch {
            // Ignore audio context errors
        }
    }

    // Wheel spin tick
    public playSpinTick() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.03);
        } catch {}
    }
}

export const coffeeSound = new CoffeeSoundPlayer();
