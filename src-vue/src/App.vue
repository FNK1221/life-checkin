<template>
  <div id="life-app">
    <!-- 载入音乐 -->
    <audio id="loadingAudio" src="/loading_music.mp3" autoplay muted></audio>

    <!-- 开场动画 -->
    <LoadingScreen @loading-complete="onLoadingComplete" />

    <!-- 天空区域（含标题、进度、主题切换） -->
    <SkySection
      :done-count="doneCount"
      :total-count="totalCount"
    />

    <!-- 电脑端：左侧导航（仅保留设置入口） -->
    <nav class="app-nav">
      <div class="nav-actions">
        <button class="nav-btn nav-btn-settings" @click="showDataPanel = true" title="设置">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="main-content">
      <main class="app-main">
        <router-view />
      </main>

      <!-- 手机端底部栏 -->
      <nav class="bottom-bar">
        <button
          class="bottom-btn"
          :class="{ active: $route.path === '/' || $route.path.startsWith('/chapter') }"
          @click="$router.push('/')"
        >
          <span class="icon">📋</span>
          <span>打卡</span>
        </button>
        <button
          class="bottom-btn"
          :class="{ active: $route.path === '/stats' }"
          @click="$router.push('/stats')"
        >
          <span class="icon">📊</span>
          <span>统计</span>
        </button>
        <button
          class="bottom-btn"
          :class="{ active: $route.path === '/memory' }"
          @click="$router.push('/memory')"
        >
          <span class="icon">⏳</span>
          <span>时光轴</span>
        </button>
        <button class="bottom-btn" @click="showDataPanel = true">
          <span class="icon">⚙️</span>
          <span>设置</span>
        </button>
      </nav>
    </div>

    <!-- 数据管理面板 -->
    <DataPanel
      :visible="showDataPanel"
      @close="showDataPanel = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DataPanel from './components/DataPanel.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import SkySection from './components/SkySection.vue'
import { loadCheckinData, loadCustomEvents } from './utils/storage.js'

const showDataPanel = ref(false)
const loadingComplete = ref(false)
const checkinData = ref({})
const customEvents = ref([])

// 进度计算（传给 SkySection）
const doneCount = computed(() => {
  let c = 0
  Object.values(checkinData.value).forEach(d => { if (d && d.date) c++ })
  return c
})
const totalCount = computed(() => {
  let c = 0
  const { CHAPTERS } = require('./utils/events.js')
  CHAPTERS.forEach(ch => c += ch.events.length)
  c += customEvents.value.length
  return c
})

function onLoadingComplete() {
  loadingComplete.value = true
  loadProgressData()
}

// 加载进度数据
async function loadProgressData() {
  checkinData.value = await loadCheckinData()
  customEvents.value = loadCustomEvents()
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

  // 初次加载进度
  loadProgressData()
})
</script>

<style>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 20px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,0.85);
}

html.dark-theme .app-nav {
  background: rgba(26,26,46,0.85);
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.nav-btn {
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: var(--accent);
  border-color: var(--primary);
  color: var(--primary);
}

.nav-btn-settings svg {
  display: block;
}

.app-main {
  min-height: calc(100vh - 60px);
}
</style>