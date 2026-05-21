<template>
  <div class="stats-view">
    <!-- Hero 区域 -->
    <div class="stats-hero">
      <div class="stats-hero-num">{{ doneCount }}</div>
      <div class="stats-hero-label">共 {{ totalCount }} 个经历，已完成 {{ progressPct }}%</div>
      <div class="stats-hero-bar">
        <div class="stats-hero-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
      <div v-if="personalityTag" class="personality-tag">{{ personalityTag }}</div>
      <div v-if="nextMilestone" class="next-milestone">{{ nextMilestone }}</div>
    </div>

    <!-- 各章节完成度（柱状图） -->
    <div class="stats-card">
      <div class="stats-card-title">📊 各章节完成度</div>
      <div class="stats-chart">
        <div v-for="s in chapterStats" :key="s.title" class="stats-bar-wrap">
          <div class="stats-bar" :style="{ height: s.height + 'px' }"></div>
          <div class="stats-bar-label">{{ s.icon }}<br>{{ s.count }}/{{ s.total }}</div>
        </div>
      </div>
    </div>

    <!-- 数据网格 -->
    <div class="stats-card">
      <div class="stats-grid">
        <div class="stats-grid-item">
          <div class="stats-grid-num">{{ photoCount }}</div>
          <div class="stats-grid-label">照片记录</div>
        </div>
        <div class="stats-grid-item">
          <div class="stats-grid-num">{{ recentDateStr }}</div>
          <div class="stats-grid-label">最近打卡</div>
        </div>
        <div class="stats-grid-item">
          <div class="stats-grid-num">{{ completedChapters }}</div>
          <div class="stats-grid-label">已完成章节</div>
        </div>
      </div>
    </div>

    <!-- 打卡热力图 -->
    <div class="stats-card heatmap-card">
      <div class="stats-card-title">🗓️ 打卡热力图</div>
      <div class="heatmap-title">{{ heatmapTitle }}</div>
      <div class="heatmap-grid" ref="heatmapGrid"></div>
      <div class="heatmap-months" ref="heatmapMonths"></div>
    </div>

    <!-- 分享按钮 -->
    <div class="stats-card">
      <div class="stats-card-title">📤 分享你的进度</div>
      <button class="data-btn primary" @click="$emit('share')" style="margin-top:12px;">🎨 生成精美分享卡片</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { CHAPTERS } from '../utils/events.js'
import { loadCheckinData, loadCustomEvents } from '../utils/storage.js'

const emit = defineEmits(['share'])

// ========== 数据 ==========
const checkinData = ref({})
const customEvents = ref([])

async function loadData() {
  checkinData.value = await loadCheckinData()
  customEvents.value = loadCustomEvents()
}

// ========== 计算属性 ==========
const allEvents = computed(() => {
  const list = []
  CHAPTERS.forEach((ch, ci) => {
    ch.events.forEach((ev, ei) => {
      list.push({ id: ci + '-' + ei, chapter: ci, name: ev })
    })
  })
  customEvents.value.forEach(ce => {
    list.push({ id: ce.id, chapter: ce.chapterIndex, name: ce.name, custom: true })
  })
  return list
})

const totalCount = computed(() => allEvents.value.length)
const doneCount = computed(() => Object.keys(checkinData.value).length)
const progressPct = computed(() => {
  return totalCount.value > 0 ? Math.round(doneCount.value / totalCount.value * 100) : 0
})

// 各章节统计
const chapterStats = computed(() => {
  return CHAPTERS.map((ch, ci) => {
    let count = 0
    ch.events.forEach((_, ei) => {
      if (checkinData.value[ci + '-' + ei]) count++
    })
    // 也统计自定义事件
    customEvents.value.forEach(ce => {
      if (ce.chapterIndex === ci && checkinData.value[ce.id]) count++
    })
    const height = ch.events.length > 0 ? Math.max(4, Math.round(count / ch.events.length * 90)) : 4
    return { title: ch.title, icon: ch.icon, count, total: ch.events.length, height }
  })
})

const photoCount = computed(() => {
  let c = 0
  Object.keys(checkinData.value).forEach(k => {
    if (checkinData.value[k].photo) c++
  })
  return c
})

const recentDateStr = computed(() => {
  let recent = ''
  Object.keys(checkinData.value).forEach(k => {
    const d = checkinData.value[k].date
    if (d && (!recent || d > recent)) recent = d
  })
  if (!recent) return '-'
  try {
    const parts = recent.split('-')
    return parseInt(parts[0]) + '.' + parseInt(parts[1]) + '.' + parseInt(parts[2])
  } catch (e) {
    return recent
  }
})

const completedChapters = computed(() => {
  let completed = 0
  chapterStats.value.forEach(s => {
    // 需要同时考虑默认事件和自定义事件的总数的章节
    let total = s.total
    customEvents.value.forEach(ce => {
      if (ce.chapterIndex === CHAPTERS.indexOf(CHAPTERS.find(ch => ch.title === s.title))) total++
    })
    if (s.count >= total && total > 0) completed++
  })
  return completed
})

// 个性标签
const personalityTag = computed(() => {
  const chapterCount = CHAPTERS.map((ch, ci) => {
    let count = 0
    ch.events.forEach((_, ei) => {
      if (checkinData.value[ci + '-' + ei]) count++
    })
    return { index: ci, count, title: ch.title, icon: ch.icon }
  })
  chapterCount.sort((a, b) => b.count - a.count)
  const top = chapterCount[0]
  if (!top || top.count === 0) return '🌱 人生新芽'

  const tags = {
    0: ['🌱 童年回忆家', '📸 纯真岁月'],
    1: ['📚 求学追梦人', '🎓 知识探索者'],
    2: ['💼 职场奋斗者', '🚀 事业打拼家'],
    3: ['❤️ 温暖家人', '💑 感情丰富家'],
    4: ['🏠 生活家', '🍳 居家能手'],
    5: ['🌍 冒险家', '✈️ 世界探索者'],
    6: ['🎉 仪式感达人', '📷 回忆收藏家'],
    7: ['🕰️ 人生智者', '🌟 岁月沉淀家']
  }
  const options = tags[top.index] || ['🌟 人生体验家']
  return options[Math.floor(Math.random() * options.length)]
})

// 下一个里程碑
const nextMilestone = computed(() => {
  const pct = progressPct.value
  const milestones = [25, 50, 75, 100]
  for (let i = 0; i < milestones.length; i++) {
    if (pct < milestones[i]) {
      const target = milestones[i]
      const needed = Math.ceil(target / 100 * totalCount.value) - doneCount.value
      return '🎯 再完成 ' + Math.max(needed, 1) + ' 个体验，就能达到 ' + target + '%！'
    }
  }
  return '🎊 恭喜你，已完成所有里程碑！'
})

// ========== 热力图 ==========
const heatmapGrid = ref(null)
const heatmapMonths = ref(null)
const heatmapTitle = ref('')

function buildHeatmap() {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364)
  startDate.setFullYear(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

  // 按日期索引打卡次数
  const countMap = {}
  Object.keys(checkinData.value).forEach(k => {
    const d = checkinData.value[k].date
    if (!d) return
    countMap[d] = (countMap[d] || 0) + 1
  })

  // 构建按周的网格 (53列 x 7行)
  const weeks = []
  const current = new Date(startDate)
  // 调整到本周的周日
  while (current.getDay() !== 0) {
    current.setDate(current.getDate() - 1)
  }

  let week = []
  while (current <= today) {
    const ds = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0') + '-' + String(current.getDate()).padStart(2, '0')
    week.push({ date: ds, dow: current.getDay() })
    if (current.getDay() === 6) {
      weeks.push(week)
      week = []
    }
    current.setDate(current.getDate() + 1)
  }
  if (week.length > 0) weeks.push(week)

  // 生成网格 DOM
  nextTick(() => {
    const gridEl = heatmapGrid.value
    if (!gridEl) return
    gridEl.innerHTML = ''

    weeks.forEach(week => {
      for (let d = 0; d < 7; d++) {
        let cell = week.find(w => w.dow === d)
        let level = 0
        if (cell) {
          const cnt = countMap[cell.date] || 0
          if (cnt >= 4) level = 4
          else if (cnt >= 3) level = 3
          else if (cnt >= 2) level = 2
          else if (cnt >= 1) level = 1
        }
        const div = document.createElement('div')
        let cls = 'heatmap-cell level-' + level
        // 今天高亮
        const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')
        if (cell && cell.date === todayStr) cls += ' today'
        div.className = cls
        if (cell) div.title = cell.date + '：' + (countMap[cell.date] || 0) + ' 个打卡'
        gridEl.appendChild(div)
      }
    })

    // 月份标签
    const monthsEl = heatmapMonths.value
    if (monthsEl) {
      monthsEl.innerHTML = ''
      let lastMonth = -1
      weeks.forEach((week, wi) => {
        if (week.length === 0) return
        const m = new Date(week[0].date).getMonth()
        if (m !== lastMonth) {
          const span = document.createElement('span')
          span.textContent = (m + 1) + '月'
          span.style.gridColumn = (wi + 1)
          monthsEl.appendChild(span)
          lastMonth = m
        }
      })
    }

    // 标题
    heatmapTitle.value = '过去一年（' +
      startDate.getFullYear() + '.' + (startDate.getMonth() + 1) + '.' + startDate.getDate() + ' - ' +
      (today.getMonth() + 1) + '.' + today.getDate() + '）'
  })
}

onMounted(() => {
  loadData().then(() => {
    buildHeatmap()
  })
})
</script>

<style scoped>
/* ========== HERO ========== */
.stats-hero {
  background: linear-gradient(145deg, #d4a574, #c47a5e, #b86248);
  border-radius: var(--radius);
  padding: 32px 20px;
  text-align: center;
  color: #fff;
  box-shadow: 0 6px 24px rgba(160, 100, 60, 0.3);
  margin-bottom: 14px;
}
.stats-hero-num { font-size: 52px; font-weight: 800; line-height: 1; letter-spacing: -2px; }
.stats-hero-label { font-size: 13px; opacity: 0.85; margin-top: 6px; }
.stats-hero-bar {
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  height: 8px;
  margin: 16px auto 0;
  max-width: 220px;
  overflow: hidden;
}
.stats-hero-fill {
  height: 100%;
  border-radius: 20px;
  background: #fff;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.personality-tag {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.9;
}
.next-milestone {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.8;
}

/* ========== CARD ========== */
.stats-card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;
  margin-bottom: 12px;
}
.stats-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 14px;
}

/* ========== CHART ========== */
.stats-chart {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 110px;
  padding: 0 2px;
}
.stats-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}
.stats-bar {
  width: 100%;
  max-width: 30px;
  border-radius: 6px 6px 0 0;
  min-height: 3px;
  background: linear-gradient(0deg, var(--primary), var(--primary-light));
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.stats-bar-label {
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 5px;
  text-align: center;
  line-height: 1.2;
}

/* ========== GRID ========== */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  text-align: center;
}
.stats-grid-item { padding: 10px 4px; }
.stats-grid-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}
.stats-grid-label { font-size: 11px; color: var(--text-muted); margin-top: 5px; }

/* ========== HEATMAP ========== */
.heatmap-card { margin-top: 12px; }
.heatmap-title { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; text-align: center; }
.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(53, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 2px;
  max-width: 100%;
  overflow-x: auto;
  padding: 4px 0;
}
.heatmap-cell {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 2px;
  background: var(--accent2);
  transition: background 0.2s;
}
.heatmap-cell.level-0 { background: var(--accent2); }
.heatmap-cell.level-1 { background: rgba(196,122,94,0.2); }
.heatmap-cell.level-2 { background: rgba(196,122,94,0.4); }
.heatmap-cell.level-3 { background: rgba(196,122,94,0.6); }
.heatmap-cell.level-4 { background: rgba(196,122,94,0.85); }
.heatmap-cell.today { box-shadow: 0 0 0 1.5px var(--primary) inset; }
.heatmap-months {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 4px;
  padding: 0 2px;
}

/* ========== SHARE BTN ========== */
.data-btn {
  display: block;
  width: 100%;
  padding: 13px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  background: var(--card-alt);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 10px;
  text-align: center;
  transition: all 0.15s;
  font-family: inherit;
  -webkit-appearance: none;
  box-sizing: border-box;
}
.data-btn:active { background: var(--accent); transform: scale(0.98); }
.data-btn.primary {
  background: linear-gradient(145deg, var(--primary-light), var(--primary-dark));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(196,122,94,0.3);
}
</style>
