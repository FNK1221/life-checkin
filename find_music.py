#!/usr/bin/env python3
"""
从 Pixabay API 获取真实的免费音乐下载链接
然后下载柔美风格的纯音乐
"""

import requests
import json
import os

# Pixabay API Key (免费，无需注册)
# 使用公开 API key
API_KEY = "YOUR_API_KEY"  # 需要注册获取

# 如果没有 API key，使用网页抓取方法
def search_pixabay_music():
    """搜索 Pixabay 上的 calm/ambient 音乐"""
    
    # 使用 Pixabay 网页搜索（不需要 API key）
    search_urls = [
        "https://pixabay.com/music/search/calm%20ambient/",
        "https://pixabay.com/music/search/meditation/",
        "https://pixabay.com/music/search/relaxing/",
    ]
    
    print("🔍 搜索 Pixabay 上的柔美风格音乐...")
    print("   由于 Cloudflare 保护，建议使用以下方法：")
    print()
    print("方法1: 手动访问 Pixabay Audio 并下载")
    print("   URL: https://pixabay.com/music/search/calm%20ambient/")
    print("   找到喜欢的曲子 → 点击下载按钮 → 保存 MP3")
    print()
    print("方法2: 使用 Python requests 下载（需要找到直接的 CDN 链接）")
    print()
    
    # 尝试使用 requests 访问（可能会失败，因为 Cloudflare）
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        # 这个请求会被 Cloudflare 拦截
        response = requests.get(search_urls[0], headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            # 解析 HTML，找到音乐下载链接
            # 这很复杂，因为 Pixabay 使用 JavaScript 加载
            print("✅ 页面获取成功，但需要解析 JavaScript 生成的内容")
        else:
            print("❌ 被 Cloudflare 拦截")
    except Exception as e:
        print(f"❌ 请求失败: {e}")
    
    print()
    print("💡 推荐方案：")
    print("   1. 访问 https://pixabay.com/music/")
    print("   2. 搜索关键词: 'calm ambient' 或 'meditation'")
    print("   3. 试听并下载喜欢的曲子")
    print("   4. 把下载的 MP3 文件放到项目目录")
    print()

if __name__ == "__main__":
    search_pixabay_music()
