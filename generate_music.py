#!/usr/bin/env python3
"""
生成"时间长河、转瞬即逝"主题音频
- 流水底声（滤波噪声）
- 水滴音符（正弦波 + 快速衰减）
- 低频持续音（D2  drone）
- 空间回声（延迟）
"""

import numpy as np
import wave
import struct
import os

# 音频参数
SAMPLE_RATE = 44100
DURATION = 8.0  # 8秒，与载入动画同步
SAMPLES = int(SAMPLE_RATE * DURATION)

def generate_river_audio():
    """生成主音频数据"""
    # 时间轴
    t = np.linspace(0, DURATION, SAMPLES, dtype=np.float64)
    
    # === 层1: 流水底声（滤波噪声）===
    # 生成白噪声
    np.random.seed(42)
    noise = np.random.uniform(-1, 1, SAMPLES)
    
    # 低通滤波（简单移动平均 + IIR）
    # 模拟流水声（低频成分）
    b = np.ones(100) / 100  # 移动平均滤波
    river_ambient = np.convolve(noise, b, mode='same')
    
    # 再次滤波，只保留非常低频的部分
    b2 = np.ones(500) / 500
    river_ambient = np.convolve(river_ambient, b2, mode='same')
    
    # 淡入淡出
    fade_in = np.linspace(0, 1, int(0.5 * SAMPLE_RATE))
    fade_out = np.linspace(1, 0, int(0.5 * SAMPLE_RATE))
    envelope = np.ones(SAMPLES)
    envelope[:len(fade_in)] = fade_in
    envelope[-len(fade_out):] = fade_out
    
    river_ambient *= 0.15 * envelope  # 音量控制
    
    # === 层2: 水滴音符（稀疏分布）===
    # D 小调五声音阶频率
    # D4=293.66, E4=329.63, G4=392.00, A4=440.00, B4=493.88
    notes = [
        (293.66, 0.5, 0.3),   # D4, 开始0.5s, 持续时间0.3s
        (392.00, 2.0, 0.25),  # G4, 开始2.0s
        (493.88, 3.8, 0.2),   # B4, 开始3.8s
        (440.00, 5.2, 0.25),  # A4, 开始5.2s
        (293.66, 6.5, 0.6),   # D4, 开始6.5s, 长衰减
    ]
    
    water_drops = np.zeros(SAMPLES)
    
    for freq, start_time, duration in notes:
        start_sample = int(start_time * SAMPLE_RATE)
        end_sample = min(int((start_time + duration) * SAMPLE_RATE), SAMPLES)
        n_samples = end_sample - start_sample
        
        # 水滴音：正弦波 + 指数衰减 + 轻微泛音
        note_t = np.linspace(0, duration, n_samples)
        
        # 主音（正弦波）
        main_tone = np.sin(2 * np.pi * freq * note_t)
        
        # 指数衰减包络
        decay = np.exp(-note_t * 8)  # 快速衰减
        
        # 轻微泛音（高频，更快衰减）
        overtone = 0.3 * np.sin(2 * np.pi * freq * 2.0 * note_t) * np.exp(-note_t * 15)
        
        # 合并
        note = (main_tone + overtone) * decay * 0.4
        
        water_drops[start_sample:end_sample] += note
    
    # === 层3: 低频持续音（D2 drone）===
    drone_freq = 73.42  # D2
    drone = np.sin(2 * np.pi * drone_freq * t)
    
    # Drone 包络：1秒后淡入，最后1秒淡出
    drone_envelope = np.ones(SAMPLES)
    fade_in_samples = int(1.0 * SAMPLE_RATE)
    fade_out_samples = int(1.0 * SAMPLE_RATE)
    drone_envelope[:fade_in_samples] = np.linspace(0, 1, fade_in_samples)
    drone_envelope[-fade_out_samples:] = np.linspace(1, 0, fade_out_samples)
    
    drone *= 0.08 * drone_envelope  # 很轻的 drone
    
    # === 层4: 空间回声（延迟）===
    # 添加3个延迟回声，模拟空间感
    reverb_signal = np.zeros(SAMPLES)
    
    # 合并所有声音
    raw_signal = river_ambient + water_drops + drone
    
    # 添加回声
    delay_times = [0.08, 0.15, 0.28]  # 延迟时间（秒）
    delay_gains = [0.25, 0.15, 0.08]  # 回声增益
    
    reverb_signal = raw_signal.copy()
    for delay, gain in zip(delay_times, delay_gains):
        delay_samples = int(delay * SAMPLE_RATE)
        reverb_signal[delay_samples:] += raw_signal[:-delay_samples] * gain
    
    # === 最终混音 ===
    final_signal = reverb_signal
    
    # 标准化（防止削波）
    max_val = np.max(np.abs(final_signal))
    if max_val > 0:
        final_signal = final_signal / max_val * 0.95
    
    return final_signal

def save_wav(filename, signal, sample_rate=SAMPLE_RATE):
    """保存为 WAV 文件"""
    # 转换为 16-bit PCM
    signal_int16 = (signal * 32767).astype(np.int16)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # 单声道
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        # 写入数据
        frames = signal_int16.tobytes()
        wav_file.writeframes(frames)
    
    print(f"✅ 音频已保存: {filename}")
    print(f"   时长: {len(signal) / sample_rate:.2f} 秒")
    print(f"   采样率: {sample_rate} Hz")
    print(f"   声道: 单声道")
    print(f"   位深度: 16-bit")

if __name__ == "__main__":
    print("🎵 生成「时间长河、转瞬即逝」主题音频...")
    print("   风格: 空灵、流水感、短暂易逝")
    print(f"   时长: {DURATION} 秒\n")
    
    # 生成音频
    signal = generate_river_audio()
    
    # 保存文件
    output_file = os.path.join(os.path.dirname(__file__), "loading_music.wav")
    save_wav(output_file, signal)
    
    print(f"\n✅ 完成！音频文件已生成，请审听。")
