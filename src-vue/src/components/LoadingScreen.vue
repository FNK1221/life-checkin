<template>
  <Transition name="loading-fade">
    <div v-if="show" class="loading-screen">
      <div class="loading-inner">
        <!-- 旋转光环 -->
        <div class="loading-ring">
          <div class="loading-ring-inner"></div>
        </div>
        <!-- 标题 -->
        <h1 class="loading-title">人生体验卡</h1>
        <!-- 阶段文字 -->
        <p class="loading-text">{{ currentText }}</p>
        <!-- 提示 -->
        <p class="loading-hint">点击屏幕任意处开启音乐</p>
      </div>
      <!-- 跳过按钮 -->
      <button class="loading-skip" @click="finish">跳过</button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['loading-complete'])

const show = ref(true)
const currentText = ref('正在孕育生命…')

const texts = [
  '正在孕育生命…',
  '万物共生…',
  '破茧成蝶…',
  '新生绽放…',
  '欢迎来到人生体验卡'
]

let textIndex = 0
let textTimer = null
let finishTimer = null

onMounted(() => {
  // 文字轮播
  textTimer = setInterval(() => {
    textIndex++
    if (textIndex < texts.length) {
      currentText.value = texts[textIndex]
    }
  }, 800)

  // 3.5秒后自动结束
  finishTimer = setTimeout(() => {
    finish()
  }, 3800)
})

onBeforeUnmount(() => {
  clearInterval(textTimer)
  clearTimeout(finishTimer)
})

function finish() {
  clearInterval(textTimer)
  clearTimeout(finishTimer)
  show.value = false
  setTimeout(() => {
    emit('loading-complete')
  }, 500)
}
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: linear-gradient(180deg, #1a0e0a 0%, #2a1510 50%, #1a0e0a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-inner {
  text-align: center;
  padding: 40px;
}

/* 旋转光环 */
.loading-ring {
  width: 80px;
  height: 80px;
  margin: 0 auto 28px;
  position: relative;
}

.loading-ring::before,
.loading-ring::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}

.loading-ring::before {
  inset: 0;
  border-top-color: rgba(252, 232, 216, 0.6);
  border-right-color: rgba(252, 232, 216, 0.3);
  animation: spin 1.2s linear infinite;
}

.loading-ring::after {
  inset: 8px;
  border-bottom-color: rgba(196, 122, 94, 0.5);
  border-left-color: rgba(196, 122, 94, 0.2);
  animation: spin 1.8s linear infinite reverse;
}

.loading-ring-inner {
  position: absolute;
  inset: 16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(252, 232, 216, 0.1) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
}

/* 标题 */
.loading-title {
  font-size: 28px;
  font-weight: 700;
  color: #fce8d8;
  letter-spacing: 4px;
  margin-bottom: 16px;
  text-shadow: 0 2px 12px rgba(252, 232, 216, 0.3);
  animation: fadeInUp 0.6s ease both;
}

/* 阶段文字 */
.loading-text {
  font-size: 15px;
  color: rgba(252, 232, 216, 0.7);
  letter-spacing: 2px;
  min-height: 22px;
  animation: fadeInUp 0.6s ease 0.2s both;
}

/* 提示 */
.loading-hint {
  font-size: 12px;
  color: rgba(252, 232, 216, 0.35);
  margin-top: 32px;
  animation: fadeInUp 0.6s ease 0.4s both;
}

/* 跳过按钮 */
.loading-skip {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  padding: 5px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.loading-skip:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Vue Transition */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.5s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
