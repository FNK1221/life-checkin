<template>
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

  <!-- 夜间星星 -->
  <div v-if="isDark" class="night-stars" ref="starsContainer">
    <div
      v-for="star in stars"
      :key="star.id"
      class="star"
      :style="star.style"
    ></div>
  </div>

  <!-- 流星容器（Teleport 到 body） -->
  <Teleport to="body">
    <div
      v-for="meteor in meteors"
      :key="meteor.id"
      class="shooting-star"
      :style="meteor.style"
    ></div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const stars = ref([])
const meteors = ref([])
const starsContainer = ref(null)
let starId = 0
let meteorId = 0
let meteorTimer = null
let isDark = ref(false)

// 检测夜间模式
function updateTheme() {
  isDark.value = document.documentElement.classList.contains('dark-theme')
}

// 生成星星
function generateStars() {
  if (!isDark.value) { stars.value = []; return }
  const count = 18 + Math.floor(Math.random() * 10)
  const newStars = []
  for (let i = 0; i < count; i++) {
    const id = ++starId
    const size = 2 + Math.random() * 3.5
    const x = Math.random() * 320 // header 宽度约 320px
    const y = Math.random() * 200
    const dur = (1.2 + Math.random() * 2.8) + 's'
    const delay = (Math.random() * 3.5) + 's'
    const o1 = (0.25 + Math.random() * 0.35).toFixed(2)
    const o2 = (0.65 + Math.random() * 0.35).toFixed(2)
    newStars.push({
      id,
      style: {
        left: x + 'px',
        top: y + 'px',
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

// 流星
function scheduleMeteor() {
  if (!isDark.value) return
  const delay = 3000 + Math.random() * 6000
  meteorTimer = setTimeout(() => {
    createMeteor()
    scheduleMeteor()
  }, delay)
}

function createMeteor() {
  const id = ++meteorId
  let startX, startY
  if (Math.random() > 0.4) {
    startX = window.innerWidth * 0.5 + Math.random() * window.innerWidth * 0.5
    startY = -10
  } else {
    startX = window.innerWidth + 10
    startY = Math.random() * window.innerHeight * 0.4
  }
  const len = 60 + Math.random() * 80
  const dur = (0.5 + Math.random() * 0.5).toFixed(2)
  meteors.value.push({
    id,
    style: {
      position: 'fixed',
      left: startX + 'px',
      top: startY + 'px',
      width: len + 'px',
      height: '1.5px',
      background: `linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9) 60%, #fff)`,
      borderRadius: '1px',
      pointerEvents: 'none',
      zIndex: 3,
      opacity: 0,
      animation: `shootingStarFly ${dur}s ease-out forwards`
    }
  })
  setTimeout(() => {
    meteors.value = meteors.value.filter(m => m.id !== id)
  }, 1200)
}

// 监听主题变化
const observer = new MutationObserver(() => {
  updateTheme()
  generateStars()
})

onMounted(() => {
  updateTheme()
  generateStars()
  scheduleMeteor()

  // 监听 html 的 class 变化
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  observer.disconnect()
  if (meteorTimer) clearTimeout(meteorTimer)
})
</script>

<style scoped>
  /* ========== DAY MODE CLOUDS ========== */
  .day-clouds {
    display: block;
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  html.dark-theme .day-clouds {
    display: none;
  }

  .cloud {
    position: absolute;
    pointer-events: none;
    z-index: 2;
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

  /* 移动端云朵尺寸缩小 */
  @media (max-width: 640px) {
    .cloud-1 { top: 14px; left: 58px; width: 42px; height: 20px; }
    .cloud-1 .cloud-puff:nth-child(1) { width: 20px; height: 16px; }
    .cloud-1 .cloud-puff:nth-child(2) { width: 24px; height: 18px; left: 12px; }
    .cloud-1 .cloud-puff:nth-child(3) { width: 18px; height: 14px; left: 26px; }
    .cloud-2 { top: 10px; right: 50px; width: 56px; height: 24px; }
    .cloud-2 .cloud-puff:nth-child(1) { width: 24px; height: 18px; }
    .cloud-2 .cloud-puff:nth-child(2) { width: 30px; height: 22px; left: 16px; }
    .cloud-2 .cloud-puff:nth-child(3) { width: 22px; height: 17px; left: 36px; }
    .cloud-2 .cloud-puff:nth-child(4) { width: 16px; height: 13px; left: 48px; }
    .cloud-3 { bottom: 32px; left: 8px; width: 36px; height: 16px; }
    .cloud-3 .cloud-puff:nth-child(1) { width: 16px; height: 13px; }
    .cloud-3 .cloud-puff:nth-child(2) { width: 20px; height: 15px; left: 10px; }
    .cloud-3 .cloud-puff:nth-child(3) { width: 14px; height: 11px; left: 24px; }
    .cloud-4 { bottom: 36px; right: 8px; width: 48px; height: 21px; }
    .cloud-4 .cloud-puff:nth-child(1) { width: 22px; height: 17px; }
    .cloud-4 .cloud-puff:nth-child(2) { width: 26px; height: 20px; left: 14px; }
    .cloud-4 .cloud-puff:nth-child(3) { width: 18px; height: 14px; left: 32px; }
  }
  @media (max-width: 380px) {
    .cloud-1 { left: 50px; width: 36px; height: 17px; }
    .cloud-2 { right: 40px; width: 46px; height: 20px; }
    .cloud-3 { display: none; }
    .cloud-4 { display: none; }
  }

  /* ========== NIGHT MODE STARS ========== */
  .night-stars {
    display: none;
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  html.dark-theme .night-stars {
    display: block;
  }

  .star {
    position: absolute;
    pointer-events: none;
    z-index: 2;
    animation: starTwinkle var(--dur) ease-in-out infinite;
    animation-delay: var(--delay);
  }

  @keyframes starTwinkle {
    0%, 100% { opacity: var(--o1, 0.3); transform: scale(1); }
    50% { opacity: var(--o2, 0.95); transform: scale(1.25); }
  }

  /* 流星 */
  :deep(.shooting-star) {
    position: fixed;
    pointer-events: none;
    z-index: 3;
    opacity: 0;
  }
</style>

<style>
  /* 流星动画（全局） */
  @keyframes shootingStarFly {
    0% { opacity: 0; }
    12% { opacity: 1; }
    100% { opacity: 0; transform: translate(-220px, 110px) scale(0.2); }
  }
</style>
