<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="share-overlay" @click.self="$emit('close')">
        <div class="share-modal">
          <!-- 头部 -->
          <div class="share-header">
            <h3>🎨 生成分享卡片</h3>
            <button class="share-close" @click="$emit('close')">✕</button>
          </div>

          <!-- 操作区 -->
          <div class="share-actions">
            <button class="share-generate-btn" @click="generate">
              🎨 生成精美分享卡片
            </button>
          </div>

          <!-- 预览区 -->
          <div v-if="imageUrl" class="share-preview">
            <img :src="imageUrl" alt="分享卡片" class="share-img" />
          </div>

          <!-- 下载按钮 -->
          <div v-if="imageUrl" class="share-download">
            <button class="share-download-btn" @click="download">
              ⬇ 下载图片
            </button>
          </div>

          <div v-if="generating" class="share-loading">
            ⏳ 正在生成分享卡片...
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { generateShareCard } from '../utils/shareCard.js'
import { loadCheckinData } from '../utils/storage.js'
import { CHAPTERS, buildAllEvents } from '../utils/events.js'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close'])

const imageUrl = ref('')
const generating = ref(false)

async function generate() {
  generating.value = true
  imageUrl.value = ''

  try {
    // 加载打卡数据
    const checkinData = await loadCheckinData()
    const customEvents = JSON.parse(localStorage.getItem('lifeCustomEvents') || [])

    // 计算 TOTAL
    let total = 0
    CHAPTERS.forEach(ch => { total += ch.events.length })
    total += customEvents.length

    // 调用生成函数
    const url = generateShareCard(checkinData, CHAPTERS, total, customEvents)
    imageUrl.value = url
  } catch (err) {
    alert('生成分享卡片失败：' + err.message)
  } finally {
    generating.value = false
  }
}

function download() {
  if (!imageUrl.value) return
  const a = document.createElement('a')
  a.href = imageUrl.value
  a.download = '人生体验卡_分享_' + new Date().getTime() + '.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>

<style scoped>
.share-overlay {
  position: fixed;
  inset: 0;
  background: rgba(62, 45, 35, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.share-modal {
  background: var(--card, #fff);
  border-radius: 22px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0.8; }
  to { transform: translateY(0); opacity: 1; }
}

.share-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border, #e0e0e0);
  margin-bottom: 20px;
}

.share-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text, #333);
}

.share-close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--accent, #f5f5f5);
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  color: var(--text-muted, #666);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.share-close:hover {
  background: var(--border, #e0e0e0);
}

.share-actions {
  margin-bottom: 20px;
  text-align: center;
}

.share-generate-btn {
  background: linear-gradient(135deg, var(--primary, #4A90D9), #6AB0FF);
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.share-generate-btn:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.share-generate-btn:active {
  transform: scale(0.98);
}

.share-preview {
  margin: 20px 0;
  text-align: center;
}

.share-img {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.share-download {
  text-align: center;
  margin-top: 16px;
}

.share-download-btn {
  background: var(--primary, #4A90D9);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.share-download-btn:hover {
  opacity: 0.9;
}

.share-loading {
  text-align: center;
  padding: 20px;
  font-size: 14px;
  color: var(--text-muted, #666);
}
</style>
