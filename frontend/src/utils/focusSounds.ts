// Web Audio API Synthesizer for Focus & Pomodoro Sounds
// Zero external audio files required - works fully offline and reliably

import type { AmbientSoundType } from '../types/focus';

class FocusSoundPlayer {
    private ctx: AudioContext | null = null;
    public soundEnabled: boolean = true;
    private ambientSource: AudioNode | null = null;
    private ambientGain: GainNode | null = null;
    private currentAmbient: AmbientSoundType = 'none';

    constructor() {
        try {
            const savedSound = localStorage.getItem('task_manager_focus_sound');
            if (savedSound !== null) {
                this.soundEnabled = savedSound === 'true';
            }
        } catch {
            this.soundEnabled = true;
        }
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

    public setSoundEnabled(enabled: boolean) {
        this.soundEnabled = enabled;
        try {
            localStorage.setItem('task_manager_focus_sound', String(enabled));
        } catch {}
        if (!enabled) {
            this.stopAmbient();
        }
    }

    // Gentle modern Start chime
    public playStart() {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.07);

                gain.gain.setValueAtTime(0.001, now + i * 0.07);
                gain.gain.linearRampToValueAtTime(0.09, now + i * 0.07 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.45);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.07);
                osc.stop(now + i * 0.07 + 0.5);
            });
        } catch {}
    }

    // Soft Pause tone
    public playPause() {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.exponentialRampToValueAtTime(392.00, now + 0.18); // G4

            gain.gain.setValueAtTime(0.07, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        } catch {}
    }

    // Zen Tibetan singing bowl / completion bell for focus session done
    public playComplete() {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            // Rich harmonic partials for a meditative singing bowl tone
            const partials = [
                { freq: 440, gain: 0.14, decay: 3.2 },
                { freq: 884, gain: 0.08, decay: 2.8 },
                { freq: 1326, gain: 0.04, decay: 2.0 },
                { freq: 1768, gain: 0.02, decay: 1.4 },
            ];

            partials.forEach((p) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(p.freq, now);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(p.gain, now + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + p.decay + 0.1);
            });
        } catch {}
    }

    // Cheerful break finished chime
    public playBreakComplete() {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                gain.gain.setValueAtTime(0.001, now + idx * 0.08);
                gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.65);
            });
        } catch {}
    }

    // Soft woodblock tick
    public playTick() {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

            gain.gain.setValueAtTime(0.025, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.03);
        } catch {}
    }

    // Ambient background generator (continuous relaxing noise)
    public setAmbientSound(type: AmbientSoundType) {
        if (this.currentAmbient === type) return;
        this.stopAmbient();

        if (type === 'none' || !this.soundEnabled) {
            this.currentAmbient = 'none';
            return;
        }

        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const bufferSize = ctx.sampleRate * 2; // 2 seconds looped noise buffer
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            if (type === 'rain') {
                // Pink/Brown noise blend for soothing rain on window
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
                    b6 = white * 0.115926;
                }
            } else if (type === 'cafe') {
                // Warm cafe hum (low-passed filtered brown noise with subtle warmth)
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    data[i] = (lastOut + 0.02 * white) / 1.02;
                    lastOut = data[i];
                    data[i] *= 0.8;
                }
            }

            const noiseNode = ctx.createBufferSource();
            noiseNode.buffer = buffer;
            noiseNode.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(type === 'rain' ? 1200 : 600, ctx.currentTime);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.0); // Gentle fade-in

            noiseNode.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noiseNode.start();
            this.ambientSource = noiseNode;
            this.ambientGain = gain;
            this.currentAmbient = type;
        } catch {
            this.currentAmbient = 'none';
        }
    }

    public stopAmbient() {
        if (this.ambientGain && this.ctx) {
            try {
                this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
            } catch {}
        }
        setTimeout(() => {
            if (this.ambientSource) {
                try {
                    (this.ambientSource as AudioBufferSourceNode).stop();
                    this.ambientSource.disconnect();
                } catch {}
                this.ambientSource = null;
            }
            this.ambientGain = null;
            this.currentAmbient = 'none';
        }, 350);
    }
}

export const focusSound = new FocusSoundPlayer();
