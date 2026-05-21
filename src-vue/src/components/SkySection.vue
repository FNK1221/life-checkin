<template>
  <div class="sky-section" :class="{ 'dark-mode': isDark }">
    <!-- 天空背景 -->
    <div class="sky-background"></div>

    <!-- 白天云朵 -->
    <div v-if="!isDark" class="day-clouds">
      <div class="cloud cloud-1">
        <div class="cloud-puff"></div>
        <div class="cloud-puff"></div>
        <div class="cloud-puff"></div>
      </div>
      <div class="cloud cloud-2">
        <div class="cloud-puff"></div>
        <div class="cloud-puff"></div>
        <div class="cloud-puff"></div>
        <div class="cloud-puff"></div>
      </div>
      <div class="cloud cloud-3">
        <div class="cloud-puff"></div>
        <div class="cloud-puff"></div>
        <div class="cloud-puff"></div>
      </div>
      <div class="cloud cloud-4">
        <div class="cloud-puff"></div>
        <div class="cloud-puff"></div>
        <div class="cloud-puff"></div>
      </div>
    </div>

    <!-- 夜晚星星 -->
    <div v-if="isDark" class="night-stars">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="star.style"
      ></div>
    </div>

    <!-- 夜晚流星（限制在天空中） -->
    <div v-if="isDark" class="meteor-container">
      <div
        v-for="meteor in meteors"
        :key="meteor.id"
        class="shooting-star"
        :style="meteor.style"
      ></div>
    </div>

    <!-- 体验进度显示 -->
    <div class="progress-overlay">
      <div class="progress-content">
        <div class="progress-text">
          <span class="progress-label">人生体验进度</span>
          <span class="progress-value">{{ doneCount }} / {{ totalCount }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-percent">{{ progressPercent }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  doneCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

const isDark = ref(false)
const stars = ref([])
const meteors = ref([])

let starId = 0
let meteorId = 0
let meteorTimer = null

// 检测主题
function updateTheme() {
  isDark.value = document.documentElement.classList.contains('dark-theme')
}

// 生成星星
function generateStars() {
  if (!isDark.value) {
    stars.value = []
    return
  }

  const count = 25 + Math.floor(Math.random() * 15)
  const newStars = []

  for (let i = 0; i < count; i++) {
    const id = ++starId
    const size = 1.5 + Math.random() * 3
    const x = Math.random() * 100 // 百分比
    const y = Math.random() * 100 // 百分比
    const dur = (1.2 + Math.random() * 2.8) + 's'
    const delay = (Math.random() * 3.5) + 's'
    const o1 = (0.25 + Math.random() * 0.35).toFixed(2)
    const o2 = (0.65 + Math.random() * 0.35).toFixed(2)

    newStars.push({
      id,
      style: {
        left: x + '%',
        top: y + '%',
        width: size + 'px',
        height: size + 'px',
        '--dur': dur,
        '--delay': delay,
        '--o1': o1,
        '--o2': o2,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255,255,255,${o2}), rgba(255,255,255,0) 70%)`,
        boxShadow: `0 0 ${size + 2}px rgba(255,255,255,${parseFloat(o2) * 0.5})`
      }
    })
  }

  stars.value = newStars
}

// 流星调度（低频率，像真实流星）
function scheduleMeteor() {
  if (!isDark.value) return

  // 随机延迟 8-20 秒，模拟真实流星的稀有性
  const delay = 8000 + Math.random() * 12000

  meteorTimer = setTimeout(() => {
    createMeteor()
    scheduleMeteor() // 递归调度下一次
  }, delay)
}

function createMeteor() {
  const id = ++meteorId

  // 流星从天空区域的右侧或顶部出现
  const startX = 50 + Math.random() * 50 // 50-100% (右侧)
  const startY = Math.random() * 30 // 0-30% (顶部)

  const len = 40 + Math.random() * 60
  const dur = (0.6 + Math.random() * 0.4).toFixed(2)

  meteors.value.push({
    id,
    style: {
      left: startX + '%',
      top: startY + '%',
      width: len + 'px',
      height: '1.5px',
      '--meteor-dur': dur + 's',
      background: `linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9) 60%, #fff)`,
      borderRadius: '1px'
    }
  })

  // 1.2秒后移除流星
  setTimeout(() => {
    meteors.value = meteors.value.filter(m => m.id !== id)
  }, 1200)
}

// 监听主题变化
const observer = new MutationObserver(() => {
  updateTheme()
  generateStars()
})

// 计算属性
const progressPercent = computed(() => {
  if (props.totalCount === 0) return 0
  return Math.round(props.doneCount / props.totalCount * 100)
})

onMounted(() => {
  updateTheme()
  generateStars()
  scheduleMeteor()

  // 监听主题变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onBeforeUnmount(() => {
  observer.disconnect()
  if (meteorTimer) clearTimeout(meteorTimer)
})
</script>

<style scoped>
.sky-section {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-radius: 0 0 20px 20px;
  margin-bottom: 20px;
  pointer-events: none; /* 允许点击穿透 */
}

.sky-section.dark-mode {
  /* 通过 .sky-background 设置背景 */
}

/* 天空背景 */
.sky-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%);
  transition: background 0.6s ease;
}

.dark-mode .sky-background {
  background: linear-gradient(180deg, #0a0a2a 0%, #1a1a3e 50%, #2a2a4e 100%);
}

/* ========== 白天云朵 ========== */
.day-clouds {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cloud {
  position: absolute;
  pointer-events: none;
  opacity: 0.55;
  filter: blur(0.5px);
  transition: opacity 0.6s ease;
}

.cloud-puff {
  position: absolute;
  background: radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.95), rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%);
  border-radius: 50%;
}

/* 云朵1：左上，小 */
.cloud-1 { top: 18px; left: 70px; width: 60px; height: 28px; animation: cloudFloat1 8s ease-in-out infinite; }
.cloud-1 .cloud-puff:nth-child(1) { width: 28px; height: 22px; top: 6px; left: 4px; }
.cloud-1 .cloud-puff:nth-child(2) { width: 34px; height: 26px; top: 2px; left: 16px; }
.cloud-1 .cloud-puff:nth-child(3) { width: 24px; height: 20px; top: 8px; left: 36px; }

/* 云朵2：右上，中 */
.cloud-2 { top: 12px; right: 60px; width: 80px; height: 34px; animation: cloudFloat2 10s ease-in-out infinite; }
.cloud-2 .cloud-puff:nth-child(1) { width: 34px; height: 26px; top: 8px; left: 6px; }
.cloud-2 .cloud-puff:nth-child(2) { width: 42px; height: 30px; top: 2px; left: 22px; }
.cloud-2 .cloud-puff:nth-child(3) { width: 30px; height: 24px; top: 6px; left: 48px; }
.cloud-2 .cloud-puff:nth-child(4) { width: 20px; height: 18px; top: 12px; left: 64px; }

/* 云朵3：进度圈下方左侧，小 */
.cloud-3 { bottom: 38px; left: 20px; width: 50px; height: 22px; animation: cloudFloat3 9s ease-in-out infinite; opacity: 0.4; }
.cloud-3 .cloud-puff:nth-child(1) { width: 22px; height: 18px; top: 4px; left: 2px; }
.cloud-3 .cloud-puff:nth-child(2) { width: 28px; height: 20px; top: 1px; left: 14px; }
.cloud-3 .cloud-puff:nth-child(3) { width: 20px; height: 16px; top: 5px; left: 32px; }

/* 云朵4：进度圈下方右侧，中 */
.cloud-4 { bottom: 42px; right: 16px; width: 70px; height: 30px; animation: cloudFloat4 11s ease-in-out infinite; opacity: 0.45; }
.cloud-4 .cloud-puff:nth-child(1) { width: 30px; height: 24px; top: 6px; left: 4px; }
.cloud-4 .cloud-puff:nth-child(2) { width: 38px; height: 28px; top: 1px; left: 20px; }
.cloud-4 .cloud-puff:nth-child(3) { width: 26px; height: 20px; top: 8px; left: 46px; }

@keyframes cloudFloat1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(8px, -4px); }
}
@keyframes cloudFloat2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-10px, 5px); }
}
@keyframes cloudFloat3 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(6px, 3px); }
}
@keyframes cloudFloat4 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-7px, -3px); }
}

/* ========== 夜晚星星 ========== */
.night-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  pointer-events: none;
  z-index: 2;
  animation: starTwinkle var(--dur, 2s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

@keyframes starTwinkle {
  0%, 100% { opacity: var(--o1, 0.3); transform: scale(1); }
  50% { opacity: var(--o2, 0.95); transform: scale(1.25); }
}

/* ========== 夜晚流星 ========== */
.meteor-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shooting-star {
  position: absolute;
  pointer-events: none;
  opacity: 0;
  animation: shootingStarFly var(--meteor-dur, 0.6s) ease-out forwards;
}

@keyframes shootingStarFly {
  0% { opacity: 0; transform: translate(0, 0) rotate(-30deg); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translate(-150px, 80px) rotate(-30deg) scale(0.3); }
}

/* ========== 体验进度显示 ========== */
.progress-overlay {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto; /* 允许交互 */
  z-index: 10;
}

.progress-content {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 12px 20px;
  min-width: 200px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.dark-mode .progress-content {
  background: rgba(26, 26, 46, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.dark-mode .progress-text {
  color: rgba(255, 255, 255, 0.8);
}

.progress-label {
  font-weight: 500;
}

.progress-value {
  font-weight: 700;
  color: #fff;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4A90D9, #6AB0FF);
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.dark-mode .progress-fill {
  background: linear-gradient(90deg, #6AB0FF, #8EC5FF);
}

.progress-percent {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* ========== 响应式 ========== */
@media (max-width: 640px) {
  .sky-section {
    height: 200px;
    border-radius: 0 0 16px 16px;
  }

  .progress-content {
    padding: 10px 16px;
    min-width: 180px;
  }

  .progress-text {
    font-size: 12px;
  }

  .progress-percent {
    font-size: 16px;
  }

  /* 移动端云朵缩小 */
  .cloud-1 { top: 14px; left: 58px; width: 42px; height: 20px; }
  .cloud-2 { top: 10px; right: 50px; width: 56px; height: 24px; }
  .cloud-3 { bottom: 32px; left: 8px; width: 36px; height: 16px; }
  .cloud-4 { bottom: 36px; right: 8px; width: 48px; height: 21px; }
}

@media (max-width: 380px) {
  .sky-section {
    height: 180px;
  }

  .cloud-1 { left: 50px; width: 36px; height: 17px; }
  .cloud-2 { right: 40px; width: 46px; height: 20px; }
  .cloud-3,
  .cloud-4 { display: none; }
}
</style>
