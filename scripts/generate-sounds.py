"""Generate original, deterministic mono PCM chimes; no external assets needed."""
import math
import struct
import wave
from pathlib import Path

RATE = 22050
ROOT = Path(__file__).resolve().parents[1] / 'sounds'
# frequency, offset, duration, harmonic ratio, harmonic level, end frequency
PRESETS = {
    'bell': [(659.25, 0, 1.4, 2, .12, 659.25), (880, .32, 1.4, 2, .12, 880)],
    'wood': [(523.25, 0, .35, 3, .2, 523.25), (659.25, .24, .35, 3, .2, 659.25), (783.99, .48, .5, 3, .2, 783.99)],
    'bird': [(1500, 0, .18, 2, .04, 2400), (1800, .27, .22, 2, .04, 2900), (1500, .60, .28, 2, .04, 2200)],
    'water': [(1200, 0, .24, 2, .1, 500), (1500, .38, .26, 2, .1, 650), (1800, .78, .32, 2, .1, 800)],
    'bowl': [(440, 0, 3.2, 2.76, .24, 440), (442, 0, 3.2, 5.4, .08, 442)],
}
ROOT.mkdir(exist_ok=True)
for name, notes in PRESETS.items():
    length = .15 + max(at + duration for _, at, duration, *_ in notes) + .1
    samples = []
    for i in range(math.ceil(length * RATE)):
        value = 0
        for freq, at, duration, harmonic, level, end in notes:
            t = i / RATE - at - .15
            if 0 <= t < duration:
                phase = 2 * math.pi * (freq * t + (end - freq) * t * t / (2 * duration))
                envelope = min(t / .012, 1) * math.exp(-7 * t / duration) * min((duration-t)/.025, 1)
                value += envelope * (math.sin(phase) + level * math.sin(harmonic * phase))
        samples.append(value)
    peak = max(abs(v) for v in samples)
    with wave.open(str(ROOT / (name + '.wav')), 'wb') as out:
        out.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        out.writeframes(b''.join(struct.pack('<h', round(v / peak * 18000)) for v in samples))

# Gesture priming must remain silent even if play() resolves late on iOS.
with wave.open(str(ROOT / 'silence.wav'), 'wb') as out:
    out.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
    out.writeframes(b'\x00\x00' * (RATE // 4))
