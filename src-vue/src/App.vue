<template>
  <div id="life-app">
    <!-- 载入音乐 -->
    <audio id="loadingAudio" src="/loading_music.mp3" autoplay muted></audio>

    <!-- 开场动画 -->
    <LoadingScreen @loading-complete="onLoadingComplete" />

    <nav class="app-nav">
      <div class="nav-brand" @click="$router.push('/')">
        <span class="nav-icon">✦</span>
        <span class="nav-title">人生体验卡</span>
      </div>
      <div class="nav-actions">
        <button class="nav-btn" @click="showShareCard = true">🎨 分享</button>
        <button class="nav-btn" @click="showDataPanel = true">📊 数据</button>
        <button class="nav-btn" @click="toggleTheme">🌓</button>
      </div>
    </nav>

    <main class="app-main">
      <router-view />
    </main>

    <!-- 数据管理面板 -->
    <DataPanel
      :visible="showDataPanel"
      @close="showDataPanel = false"
    />

    <!-- 分享卡片 -->
    <ShareCard
      :visible="showShareCard"
      @close="showShareCard = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataPanel from './components/DataPanel.vue'
import ShareCard from './components/ShareCard.vue'
import LoadingScreen from './components/LoadingScreen.vue'

const showDataPanel = ref(false)
const showShareCard = ref(false)
const loadingComplete = ref(false)

function onLoadingComplete() {
  loadingComplete.value = true
}

// ========== 主题切换（与原 index.html 保持一致）==========
function toggleTheme() {
  const html = document.documentElement
  const isDark = html.classList.contains('dark-theme')

  // 添加过渡类
  html.classList.add('theme-transitioning')
  setTimeout(() => html.classList.remove('theme-transitioning'), 500)

  if (isDark) {
    html.classList.remove('dark-theme')
    localStorage.setItem('lifeCheckinTheme', 'light')
  } else {
    html.classList.add('dark-theme')
    localStorage.setItem('lifeCheckinTheme', 'dark')
  }
}

// 加载保存的主题
onMounted(() => {
  const saved = localStorage.getItem('lifeCheckinTheme')
  if (saved === 'dark') {
    document.documentElement.classList.add('dark-theme')
  } else if (saved === 'light') {
    document.documentElement.classList.remove('dark-theme')
  } else {
    // 跟随系统
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark-theme')
    }
  }
})
</script>

<style>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,0.85);
}

html.dark-theme .app-nav {
  background: rgba(26,26,46,0.85);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.nav-icon {
  font-size: 20px;
  color: var(--primary);
}

.nav-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.nav-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: var(--accent);
  border-color: var(--primary);
}

.app-main {
  min-height: calc(100vh - 60px);
}
</style>
