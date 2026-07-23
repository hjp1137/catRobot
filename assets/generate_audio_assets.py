import wave
import math
import struct
import os

def generate_wav(filename, duration, freq_func):
    sample_rate = 11025
    num_samples = int(duration * sample_rate)
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        for i in range(num_samples):
            t = i / sample_rate
            freq = freq_func(t, duration)
            val = math.sin(2 * math.pi * freq * t)
            
            # Envelope to avoid clicks
            envelope = 1.0
            if t < 0.01:
                envelope = t / 0.01
            elif t > duration - 0.02:
                envelope = (duration - t) / 0.02
            
            val = val * envelope
            sample = int(val * 32767)
            wav_file.writeframesraw(struct.pack('<h', sample))

def main():
    print("Generating audio prototype assets...")
    generate_wav("assets/audio/click.wav", 0.05, lambda t, d: 1000 - 200 * (t / d))
    generate_wav("assets/audio/attack.wav", 0.15, lambda t, d: 800 - 600 * (t / d))
    generate_wav("assets/audio/alert.wav", 0.3, lambda t, d: 300 + 50 * math.sin(2 * math.pi * 20 * t))
    generate_wav("assets/audio/victory.wav", 0.5, lambda t, d: 400 + 600 * (t / d))
    generate_wav("assets/audio/defeat.wav", 0.8, lambda t, d: 300 - 200 * (t / d))
    print("All audio assets generated successfully.")

if __name__ == "__main__":
    main()
