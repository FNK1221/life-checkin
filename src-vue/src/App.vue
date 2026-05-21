<template>
  <div id="life-app">
    <!-- 载入音乐 -->
    <audio id="loadingAudio" src="/loading_music.mp3" preload="auto"></audio>

    <!-- 开场动画 -->
    <LoadingScreen @loading-complete="onLoadingComplete" />

    <!-- 天空区域（含标题、进度、主题切换） -->
    <SkySection
      :done-count="doneCount"
      :total-count="totalCount"
    />



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
.app-main {
  min-height: 100vh;
}
</style>