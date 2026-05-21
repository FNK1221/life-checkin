<template>
  <div class="memory-view">
    <header class="memory-header">
      <h2>时光轴</h2>
      <p class="memory-subtitle">每一段打卡，都是人生的一枚印记</p>
    </header>

    <div v-if="memories.length === 0" class="memory-empty">
      <div class="empty-icon">🍃</div>
      <p>还没有打卡记录</p>
      <p class="empty-hint">去「打卡清单」里记录你的第一次体验吧</p>
    </div>

    <!-- 时间指示器（左侧浮动） -->
    <div v-if="memories.length > 0" class="time-indicator">
      {{ currentTimeLabel }}
    </div>

    <div v-else class="memory-timeline">
      <div
        v-for="(group, gi) in groupedMemories"
        :key="gi"
        class="memory-group"
      >
        <div class="memory-month sticky-month">{{ group.month }}</div>
        <div class="memory-items">
          <div
            v-for="(m, mi) in group.items"
            :key="m.id"
            class="memory-item scroll-animate"
            :style="{ animationDelay: mi * 0.06 + 's' }"
            @click="openPhotoViewer(m.id)"
          >
            <div class="memory-dot" :class="getSeasonClass(m.date)"></div>
            <div class="memory-card">
              <div class="memory-date">{{ m.date }}</div>
              <div class="memory-name">{{ m.name }}</div>
              <div v-if="m.note" class="memory-note">{{ m.note }}</div>
              <div v-if="m.photo" class="memory-photo-hint">📷 有照片</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PhotoViewer
      :visible="showPhotoViewer"
      :event-id="photoEventId"
      @close="showPhotoViewer = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { loadCheckinData } from '../utils/storage.js'
import { CHAPTERS } from '../utils/events.js'
import PhotoViewer from '../components/PhotoViewer.vue'

const checkinData = ref({})
const showPhotoViewer = ref(false)
const photoEventId = ref('')
const currentTimeLabel = ref('')

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
      list.push({
        id,
        name: eventNames.value[id] || data.name || '未知体验',
        date: data.date,
        note: data.note || '',
        photo: data.photo || false,
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

function openPhotoViewer(id) {
  const data = checkinData.value[id]
  if (data && data.photo) {
    photoEventId.value = id
    showPhotoViewer.value = true
  }
}

// 根据日期返回季节 class
function getSeasonClass(dateStr) {
  const m = new Date(dateStr).getMonth() + 1
  if (m >= 3 && m <= 5) return 'season-spring'
  if (m >= 6 && m <= 8) return 'season-summer'
  if (m >= 9 && m <= 11) return 'season-autumn'
  return 'season-winter'
}

// ========== 滚动动画 ==========
let observer = null

onMounted(async () => {
  checkinData.value = await loadCheckinData()
  await nextTick()

  // IntersectionObserver：卡片进入视窗时添加可见类
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.12 })

  document.querySelectorAll('.scroll-animate').forEach(el => {
    observer.observe(el)
  })

  // 监听滚动，更新时间指示器
  window.addEventListener('scroll', onScroll)
  onScroll()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  window.removeEventListener('scroll', onScroll)
})

function onScroll() {
  const items = document.querySelectorAll('.memory-item')
  if (!items.length) return
  const viewMid = window.innerHeight * 0.4
  let closest = null
  let closestDist = Infinity
  items.forEach(el => {
    const rect = el.getBoundingClientRect()
    const dist = Math.abs(rect.top - viewMid)
    if (dist < closestDist) {
      closestDist = dist
      closest = el
    }
  })
  if (closest) {
    const dateStr = closest.querySelector('.memory-date')?.textContent
    if (dateStr) {
      const d = new Date(dateStr)
      currentTimeLabel.value = `${d.getFullYear()}年${d.getMonth() + 1}月`
    }
  }
}
</script>

<style scoped>
.memory-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 16px 80px;
  position: relative;
}

.memory-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px 0;
}

.memory-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.memory-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.memory-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-hint {
  font-size: 13px;
  margin-top: 8px;
  opacity: 0.7;
}

/* ========== 时间指示器（左侧浮动）========== */
.time-indicator {
  position: fixed;
  left: max(12px, calc((100vw - 800px) / 2 - 60px));
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  background: var(--card);
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  z-index: 10;
  pointer-events: none;
  transition: opacity 0.3s;
}

/* ========== 时光轴主线 ========== */
.memory-timeline {
  position: relative;
}

.memory-timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(
    180deg,
    var(--primary-light, #d4957a),
    var(--primary, #c47a5e),
    var(--primary-dark, #a35e42)
  );
  opacity: 0.5;
  border-radius: 2px;
  /* 发光效果 */
  box-shadow:
    0 0 8px rgba(196, 122, 94, 0.3),
    0 0 20px rgba(196, 122, 94, 0.1);
}

/* ========== 月份标题（粘性）========== */
.sticky-month {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
  padding-left: 44px;
  padding-top: 8px;
  padding-bottom: 8px;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 2;
}

/* ========== 记忆卡片项 ========== */
.memory-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;
  /* 滚动动画初始状态 */
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.memory-item.visible {
  opacity: 1;
  transform: translateX(0);
}

.memory-item:hover .memory-card {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover, 0 8px 32px rgba(0,0,0,0.1));
}

/* ========== 时间圆点（带季节色）========== */
.memory-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  margin: 8px 14px 0 15px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(196, 122, 94, 0.25);
  transition: transform 0.3s, box-shadow 0.3s;
}

.memory-item.visible .memory-dot {
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(196, 122, 94, 0.25); }
  50% { box-shadow: 0 0 0 3px var(--bg), 0 0 0 8px rgba(196, 122, 94, 0.15); }
}

/* 季节配色 */
.memory-dot.season-spring {
  background: #5BBF6A;
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(91, 191, 106, 0.25);
}
.memory-dot.season-summer {
  background: #F5A623;
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(245, 166, 35, 0.25);
}
.memory-dot.season-autumn {
  background: #D46B4A;
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(212, 107, 74, 0.25);
}
.memory-dot.season-winter {
  background: #7BA7D4;
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(123, 167, 212, 0.25);
}

/* ========== 记忆卡片 ========== */
.memory-card {
  flex: 1;
  background: var(--card);
  border-radius: var(--radius, 12px);
  padding: 14px 16px;
  box-shadow: var(--shadow, 0 2px 16px rgba(0,0,0,0.06));
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 3px solid var(--primary);
}

.memory-date {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.memory-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
}

.memory-note {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 6px;
  line-height: 1.5;
  opacity: 0.85;
}

.memory-photo-hint {
  font-size: 12px;
  color: var(--primary);
  margin-top: 6px;
  opacity: 0.8;
}
</style>
