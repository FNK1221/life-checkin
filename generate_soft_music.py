#!/usr/bin/env python3
"""
生成"时间长河、转瞬即逝"主题的柔美风格音频
- 风格：空灵、弦乐质感、流水环境音
- 不是钢琴曲！
- 使用柔和的正弦波 + 合唱效果模拟弦乐
"""

import numpy as np
import wave
import struct
import os

# 音频参数
SAMPLE_RATE = 44100
DURATION = 8.0  # 8秒
SAMPLES = int(SAMPLE_RATE * DURATION)

def generate_soft_music():
    """生成柔美风格音频（非钢琴）"""
    t = np.linspace(0, DURATION, SAMPLES, dtype=np.float64)
    
    # === 层1: 流水环境音（滤波噪声）===
    np.random.seed(42)
    noise = np.random.uniform(-1, 1, SAMPLES)
    
    # 多次滤波，创造柔和的流水声（不是白噪声）
    from numpy.fft import rfft, irfft
    
    # FFT 滤波：只保留低频（流水感）
    noise_fft = rfft(noise)
    freqs = np.fft.rfftfreq(SAMPLES, 1/SAMPLE_RATE)
    
    # 低通滤波器（保留 < 2000Hz 的频率）
    lowpass_filter = 1.0 / (1.0 + (freqs / 1500.0) ** 4)
    noise_filtered = irfft(noise_fft * lowpass_filter, n=SAMPLES)
    
    # 再次滤波，让声音更柔和
    noise_filtered2 = irfft(rfft(noise_filtered) * lowpass_filter, n=SAMPLES)
    
    # 淡入淡出
    fade_samples = int(0.3 * SAMPLE_RATE)
    fade_in = np.linspace(0, 1, fade_samples)
    fade_out = np.linspace(1, 0, fade_samples)
    
    water_sound = noise_filtered2 * 0.12  # 音量
    water_sound[:fade_samples] *= fade_in
    water_sound[-fade_samples:] *= fade_out
    
    # === 层2: 柔美旋律（弦乐质感，不是钢琴）===
    # 使用多个正弦波 + 轻微失谐（chorus效果）模拟弦乐
    # 旋律：简单、空灵、转瞬即逝
    
    # 音符序列（频率，开始时间，持续时间）
    # 使用五声音阶，但用柔和的正弦波（不是钢琴的尖锐音色）
    notes = [
        (293.66, 0.8, 1.2),   # D4, 0.8s开始，持续1.2s
        (392.00, 2.2, 1.0),   # G4
        (440.00, 3.5, 0.8),   # A4
        (493.88, 4.5, 1.5),   # B4
        (392.00, 6.2, 1.5),   # G4（回归）
    ]
    
    melody = np.zeros(SAMPLES)
    
    for freq, start_time, duration in notes:
        start_sample = int(start_time * SAMPLE_RATE)
        end_sample = min(int((start_time + duration) * SAMPLE_RATE), SAMPLES)
        n_samples = end_sample - start_sample
        
        note_t = np.linspace(0, duration, n_samples)
        
        # 弦乐质感：主音 + 轻微失谐（chorus效果）
        # 主音（正弦波）
        main_tone = np.sin(2 * np.pi * freq * note_t)
        
        # 失谐音（模拟弦乐的chorus效果）
        detune1 = np.sin(2 * np.pi * (freq * 1.005) * note_t) * 0.7
        detune2 = np.sin(2 * np.pi * (freq * 0.995) * note_t) * 0.5
        
        # 合并（弦乐质感）
        string_tone = (main_tone + detune1 + detune2) / 3.0
        
        # 柔和的包络（慢攻击，慢衰减）— 不像钢琴那样瞬间达到峰值
        envelope = 1.0 - np.exp(-note_t * 3)  # 慢攻击
        envelope *= np.exp(-note_t * 1.5)       # 慢衰减
        
        # 应用包络
        note = string_tone * envelope * 0.35
        
        melody[start_sample:end_sample] += note
    
    # === 层3: 低频持续音（D2 drone，很轻）===
    drone_freq = 73.42  # D2
    drone = np.sin(2 * np.pi * drone_freq * t)
    
    # 慢攻击和慢衰减
    drone_envelope = 1.0 - np.exp(-t * 2)  # 慢攻击
    drone_envelope *= np.exp(-(DURATION - t) * 2)  # 慢衰减
    
    drone *= 0.06 * drone_envelope
    
    # === 层4: 空间回声（延迟）===
    reverb = np.zeros(SAMPLES)
    
    # 合并所有声音
    raw_signal = water_sound + melody + drone
    
    # 添加3个延迟回声（模拟空间感）
    delay_times = [0.1, 0.2, 0.35]  # 延迟时间
    delay_gains = [0.3, 0.2, 0.1]   # 回声增益
    
    reverb = raw_signal.copy()
    for delay, gain in zip(delay_times, delay_gains):
        delay_samples = int(delay * SAMPLE_RATE)
        if delay_samples < SAMPLES:
            reverb[delay_samples:] += raw_signal[:-delay_samples] * gain
    
    # === 最终混音 ===
    final_signal = reverb
    
    # 标准化
    max_val = np.max(np.abs(final_signal))
    if max_val > 0:
        final_signal = final_signal / max_val * 0.95
    
    return final_signal

def save_wav(filename, signal, sample_rate=SAMPLE_RATE):
    """保存为 WAV 文件"""
    signal_int16 = (signal * 32767).astype(np.int16)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(signal_int16.tobytes())
    
    print(f"✅ 音频已保存: {filename}")
    print(f"   时长: {len(signal) / sample_rate:.2f} 秒")
    print(f"   风格: 柔美、空灵、弦乐质感（非钢琴）")

if __name__ == "__main__":
    print("🎵 生成「时间长河、转瞬即逝」主题音频...")
    print("   风格: 柔美、空灵、弦乐质感")
    print("   不是钢琴曲！")
    print(f"   时长: {DURATION} 秒\n")
    
    # 生成音频
    signal = generate_soft_music()
    
    # 保存文件
    output_file = os.path.join(os.path.dirname(__file__), "loading_music_soft.wav")
    save_wav(output_file, signal)
    
    print(f"\n✅ 完成！音频文件已生成，请审听。")
    print(f"   如果满意，我将集成到载入动画中。")
