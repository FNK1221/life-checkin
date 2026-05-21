<template>
  <div class="memory-view">
    <!-- 梦幻背景粒子 -->
    <div class="dream-bg">
      <div v-for="n in 12" :key="n" class="dream-particle" :style="getParticleStyle(n)"></div>
    </div>

    <header class="memory-header">
      <h2>时光轴</h2>
      <p class="memory-subtitle">每一段打卡，都是人生的一枚印记</p>
    </header>

    <div v-if="memories.length === 0" class="memory-empty">
      <div class="empty-bubble">
        <div class="empty-icon">
          <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="24" cy="24" r="18" opacity="0.3"/>
            <path d="M16 24 Q20 18, 24 22 Q28 18, 32 24" opacity="0.5"/>
            <circle cx="20" cy="20" r="1.5" fill="currentColor" opacity="0.4"/>
            <circle cx="28" cy="20" r="1.5" fill="currentColor" opacity="0.4"/>
          </svg>
        </div>
        <p>还没有打卡记录</p>
        <p class="empty-hint">去「打卡清单」里记录你的第一次体验吧</p>
      </div>
    </div>

    <!-- 时间线 -->
    <div v-else class="memory-timeline">
      <div
        v-for="(group, gi) in groupedMemories"
        :key="gi"
        class="memory-group"
      >
        <!-- 月份标题 -->
        <div class="month-bubble">{{ group.month }}</div>

        <!-- 该月的记忆项 -->
        <div class="memory-items">
          <div
            v-for="(m, mi) in group.items"
            :key="m.id"
            class="memory-item scroll-animate"
            :style="{ animationDelay: mi * 0.08 + 's' }"
          >
            <!-- 时间线上的光点 -->
            <div class="memory-glow-dot" :class="getSeasonClass(m.date)"></div>

            <!-- 记忆卡片（梦幻泡影风格） -->
            <div class="memory-card dream-card">
              <div class="card-shimmer"></div>

              <!-- 日期 -->
              <div class="memory-date">{{ formatDate(m.date) }}</div>

              <!-- 标题 -->
              <div class="memory-name">{{ m.name }}</div>

              <!-- 照片（如果有） -->
              <div v-if="m.photoUrl" class="memory-photo" @click.stop="openPhoto(m.photoUrl)">
                <img :src="m.photoUrl" :alt="m.name" loading="lazy" />
                <div class="photo-glow"></div>
              </div>

              <!-- 笔记（如果有） -->
              <div v-if="m.note" class="memory-note">
                <span class="note-quote">"</span>
                {{ m.note }}
                <span class="note-quote">"</span>
              </div>

              <!-- 媒体按钮（音频/视频） -->
              <div v-if="m.hasAudio || m.hasVideo" class="media-actions">
                <button v-if="m.hasAudio" class="media-btn audio-btn" @click.stop="playMedia(m.id, 'audio')">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                  <span>听一听</span>
                </button>
                <button v-if="m.hasVideo" class="media-btn video-btn" @click.stop="playMedia(m.id, 'video')">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>看一看</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div v-if="memories.length > 0" class="timeline-end">
      <div class="end-ripple"></div>
      <div class="end-text">—— 此刻，即是永恒 ——</div>
    </div>

    <!-- 图片查看器 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showPhotoOverlay" class="photo-overlay" @click="closePhoto">
          <div class="photo-overlay-bg"></div>
          <img :src="currentPhotoUrl" class="photo-large" @click.stop />
          <button class="photo-close" @click="closePhoto">✕</button>
        </div>
      </Transition>
    </Teleport>

    <!-- 媒体播放器 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showMediaPlayer" class="media-overlay" @click="closeMediaPlayer">
          <div class="media-overlay-bg"></div>
          <div class="media-player-card" @click.stop>
            <div class="media-player-header">
              <span>{{ currentMediaType === 'audio' ? '音频播放' : '视频播放' }}</span>
              <button class="media-close" @click="closeMediaPlayer">✕</button>
            </div>
            <audio v-if="currentMediaType === 'audio' && currentMediaUrl" :src="currentMediaUrl" controls autoplay class="media-element"></audio>
            <video v-if="currentMediaType === 'video' && currentMediaUrl" :src="currentMediaUrl" controls autoplay class="media-element"></video>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { loadCheckinData, getMediaForEvent } from '../utils/storage.js'
import { CHAPTERS } from '../utils/events.js'

const checkinData = ref({})
const mediaCache = ref({}) // { eventId: { photoUrl, audioUrl, videoUrl } }
const showPhotoOverlay = ref(false)
const currentPhotoUrl = ref('')
const showMediaPlayer = ref(false)
const currentMediaUrl = ref('')
const currentMediaType = ref('')

// 构建事件名称映射
const eventNames = computed(() => {
  const map = {}
  CHAPTERS.forEach((ch, ci) => {
    ch.events.forEach((ev, ei) => {
      map[ci + '-' + ei] = ev
    })
  })
  return map
})

// 所有已打卡记录，按时间倒序
const memories = computed(() => {
  const list = []
  Object.entries(checkinData.value).forEach(([id, data]) => {
    if (data && data.date) {
      const cache = mediaCache.value[id] || {}
      list.push({
        id,
        name: eventNames.value[id] || data.name || '未知体验',
        date: data.date,
        note: data.note || '',
        photo: data.photo || false,
        photoUrl: cache.photoUrl || '',
        hasAudio: data.hasAudio || false,
        hasVideo: data.hasVideo || false,
        timestamp: new Date(data.date).getTime()
      })
    }
  })
  return list.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 按月分组
const groupedMemories = computed(() => {
  const groups = {}
  memories.value.forEach(m => {
    const d = new Date(m.date)
    const key = `${d.getFullYear()}年${d.getMonth() + 1}月`
    if (!groups[key]) groups[key] = []
    groups[key].push(m)
  })
  return Object.entries(groups).map(([month, items]) => ({ month, items }))
})

// 加载媒体文件
async function loadMedia() {
  const data = checkinData.value
  const cache = {}

  for (const [eventId, item] of Object.entries(data)) {
    if (!item || !item.date) continue
    cache[eventId] = {}

    if (item.photo) {
      const photo = await getMediaForEvent(eventId, 'photo')
      if (photo) cache[eventId].photoUrl = photo.url
    }
    if (item.hasAudio) {
      const audio = await getMediaForEvent(eventId, 'audio')
      if (audio) cache[eventId].audioUrl = audio.url
    }
    if (item.hasVideo) {
      const video = await getMediaForEvent(eventId, 'video')
      if (video) cache[eventId].videoUrl = video.url
    }
  }

  mediaCache.value = cache
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const week = weekDays[d.getDay()]
  return `${month}月${day}日 ${week}`
}

function getSeasonClass(dateStr) {
  const m = new Date(dateStr).getMonth() + 1
  if (m >= 3 && m <= 5) return 'season-spring'
  if (m >= 6 && m <= 8) return 'season-summer'
  if (m >= 9 && m <= 11) return 'season-autumn'
  return 'season-winter'
}

function getParticleStyle(n) {
  const size = 4 + Math.random() * 12
  const left = Math.random() * 100
  const delay = Math.random() * 8
  const duration = 6 + Math.random() * 8
  return {
    width: size + 'px',
    height: size + 'px',
    left: left + '%',
    animationDelay: delay + 's',
    animationDuration: duration + 's'
  }
}

// 图片查看
function openPhoto(url) {
  currentPhotoUrl.value = url
  showPhotoOverlay.value = true
  document.body.style.overflow = 'hidden'
}

function closePhoto() {
  showPhotoOverlay.value = false
  document.body.style.overflow = ''
}

// 媒体播放
async function playMedia(eventId, type) {
  const cache = mediaCache.value[eventId]
  if (!cache) return

  const url = type === 'audio' ? cache.audioUrl : cache.videoUrl
  if (!url) {
    // 尝试重新加载
    const media = await getMediaForEvent(eventId, type)
    if (media) {
      if (!mediaCache.value[eventId]) mediaCache.value[eventId] = {}
      if (type === 'audio') mediaCache.value[eventId].audioUrl = media.url
      else mediaCache.value[eventId].videoUrl = media.url
      currentMediaUrl.value = media.url
    } else {
      alert('媒体文件未找到')
      return
    }
  } else {
    currentMediaUrl.value = url
  }

  currentMediaType.value = type
  showMediaPlayer.value = true
  document.body.style.overflow = 'hidden'
}

function closeMediaPlayer() {
  showMediaPlayer.value = false
  currentMediaUrl.value = ''
  document.body.style.overflow = ''
}

// ========== 滚动动画 ==========
let observer = null

onMounted(async () => {
  checkinData.value = await loadCheckinData()
  await loadMedia()
  await nextTick()

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.scroll-animate').forEach(el => {
    observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.memory-view {
  max-width: 680px;
  margin: 0 auto;
  padding: 20px 16px 80px;
  position: relative;
}

/* ========== 梦幻背景粒子 ========== */
.dream-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.dream-particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(196,122,94,0.08), transparent 70%);
  animation: particleFloat ease-in-out infinite;
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(100vh) scale(0.5);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.4;
  }
  50% {
    transform: translateY(-10vh) scale(1);
    opacity: 0.3;
  }
}

/* ========== 头部 ========== */
.memory-header {
  text-align: center;
  margin-bottom: 36px;
  padding: 24px 0 12px;
  position: relative;
  z-index: 1;
}

.memory-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.memory-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  opacity: 0.7;
}

/* ========== 空状态 ========== */
.memory-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  position: relative;
  z-index: 1;
}

.empty-bubble {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 32px;
  border-radius: 24px;
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
  color: var(--primary);
}

.empty-hint {
  font-size: 13px;
  margin-top: 8px;
  opacity: 0.6;
}

/* ========== 时间线主线 ========== */
.memory-timeline {
  position: relative;
  z-index: 1;
}

.memory-timeline::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 60px;
  width: 2px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(196, 122, 94, 0.3) 5%,
    rgba(196, 122, 94, 0.5) 50%,
    rgba(196, 122, 94, 0.3) 95%,
    transparent 100%
  );
  border-radius: 1px;
}

/* ========== 月份标题（泡影风格） ========== */
.month-bubble {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  background: rgba(196, 122, 94, 0.08);
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
  margin-left: 44px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(196, 122, 94, 0.12);
  letter-spacing: 1px;
}

/* ========== 记忆项 ========== */
.memory-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
  /* 滚动动画初始状态 */
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.memory-item.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ========== 发光圆点 ========== */
.memory-glow-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
  margin: 14px 14px 0 20px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  box-shadow:
    0 0 0 3px var(--bg),
    0 0 0 5px rgba(196, 122, 94, 0.2),
    0 0 12px rgba(196, 122, 94, 0.3);
  transition: box-shadow 0.3s;
}

.memory-item.visible .memory-glow-dot {
  animation: dotGlow 3s ease-in-out infinite;
}

@keyframes dotGlow {
  0%, 100% {
    box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(196, 122, 94, 0.2), 0 0 12px rgba(196, 122, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 0 3px var(--bg), 0 0 0 6px rgba(196, 122, 94, 0.15), 0 0 20px rgba(196, 122, 94, 0.4);
  }
}

/* 季节配色 */
.memory-glow-dot.season-spring {
  background: #5BBF6A;
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(91, 191, 106, 0.2), 0 0 12px rgba(91, 191, 106, 0.3);
}
.memory-glow-dot.season-summer {
  background: #F5A623;
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(245, 166, 35, 0.2), 0 0 12px rgba(245, 166, 35, 0.3);
}
.memory-glow-dot.season-autumn {
  background: #D46B4A;
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(212, 107, 74, 0.2), 0 0 12px rgba(212, 107, 74, 0.3);
}
.memory-glow-dot.season-winter {
  background: #7BA7D4;
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(123, 167, 212, 0.2), 0 0 12px rgba(123, 167, 212, 0.3);
}

/* ========== 梦幻泡影卡片 ========== */
.memory-card {
  flex: 1;
  min-width: 0;
  position: relative;
  overflow: hidden;
}

.dream-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border-radius: 20px;
  padding: 16px 18px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dream-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

/* 微光扫过效果 */
.card-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0%, 100% { left: -100%; }
  50% { left: 150%; }
}

.memory-date {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 6px;
  opacity: 0.7;
  letter-spacing: 0.5px;
}

.memory-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
  margin-bottom: 10px;
}

/* ========== 照片 ========== */
.memory-photo {
  position: relative;
  margin-bottom: 10px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 16 / 10;
}

.memory-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.memory-photo:hover img {
  transform: scale(1.03);
}

.photo-glow {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 20px rgba(255,255,255,0.3);
  pointer-events: none;
  border-radius: 14px;
}

/* ========== 笔记 ========== */
.memory-note {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 10px;
  padding: 10px 12px;
  background: rgba(196, 122, 94, 0.04);
  border-radius: 12px;
  border-left: 2px solid rgba(196, 122, 94, 0.15);
}

.note-quote {
  color: var(--primary);
  opacity: 0.4;
  font-size: 16px;
}

/* ========== 媒体按钮 ========== */
.media-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.media-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 10px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.media-btn svg {
  flex-shrink: 0;
}

.audio-btn {
  background: rgba(91, 191, 106, 0.1);
  color: #4A9B56;
}

.audio-btn:hover {
  background: rgba(91, 191, 106, 0.2);
}

.video-btn {
  background: rgba(74, 144, 217, 0.1);
  color: #3A7BC0;
}

.video-btn:hover {
  background: rgba(74, 144, 217, 0.2);
}

/* ========== 时间线底部 ========== */
.timeline-end {
  text-align: center;
  padding: 40px 0 20px;
  position: relative;
  z-index: 1;
}

.end-ripple {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  margin: 0 auto 16px;
  opacity: 0.3;
  animation: endRipple 2s ease-in-out infinite;
}

@keyframes endRipple {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(2); opacity: 0.1; }
}

.end-text {
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.5;
  letter-spacing: 2px;
}

/* ========== 图片查看器 ========== */
.photo-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.photo-overlay-bg {
  position: absolute;
  inset: 0;
  background: rgba(10, 8, 18, 0.85);
  backdrop-filter: blur(20px);
}

.photo-large {
  position: relative;
  z-index: 1;
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  object-fit: contain;
}

.photo-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  transition: background 0.2s;
}

.photo-close:hover {
  background: rgba(255,255,255,0.25);
}

/* ========== 媒体播放器 ========== */
.media-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.media-overlay-bg {
  position: absolute;
  inset: 0;
  background: rgba(10, 8, 18, 0.8);
  backdrop-filter: blur(20px);
}

.media-player-card {
  position: relative;
  z-index: 1;
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  padding: 20px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.media-player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.media-close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--accent);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-element {
  width: 100%;
  border-radius: 12px;
}

/* ========== 动画过渡 ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== 响应式 ========== */
@media (max-width: 640px) {
  .memory-view {
    padding: 16px 12px 80px;
  }

  .memory-header h2 {
    font-size: 20px;
  }

  .dream-card {
    padding: 14px 15px;
    border-radius: 16px;
  }

  .memory-glow-dot {
    margin: 12px 10px 0 18px;
  }

  .month-bubble {
    margin-left: 40px;
  }

  .memory-timeline::before {
    left: 22px;
  }
}

@media (max-width: 380px) {
  .memory-name {
    font-size: 14px;
  }

  .memory-note {
    font-size: 12px;
  }
}
</style>