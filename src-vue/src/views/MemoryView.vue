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

    <div v-else class="memory-timeline">
      <div
        v-for="(group, gi) in groupedMemories"
        :key="gi"
        class="memory-group"
      >
        <div class="memory-month">{{ group.month }}</div>
        <div class="memory-items">
          <div
            v-for="m in group.items"
            :key="m.id"
            class="memory-item"
            @click="openPhotoViewer(m.id)"
          >
            <div class="memory-dot"></div>
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
import { ref, computed, onMounted } from 'vue'
import { loadCheckinData } from '../utils/storage.js'
import { CHAPTERS } from '../utils/events.js'
import PhotoViewer from '../components/PhotoViewer.vue'

const checkinData = ref({})
const showPhotoViewer = ref(false)
const photoEventId = ref('')

onMounted(async () => {
  checkinData.value = await loadCheckinData()
})

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
        photo: data.photo || false
      })
    }
  })
  // 按日期倒序
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
</script>

<style scoped>
.memory-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 16px 80px;
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

.memory-timeline {
  position: relative;
}

.memory-timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--primary-light), var(--primary));
  opacity: 0.3;
}

.memory-group {
  margin-bottom: 24px;
}

.memory-month {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 12px;
  padding-left: 44px;
}

.memory-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  position: relative;
}

.memory-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
  margin: 8px 15px 0 15px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px rgba(196, 122, 94, 0.2);
}

.memory-card {
  flex: 1;
  background: var(--card);
  border-radius: var(--radius);
  padding: 14px 16px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.memory-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
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
