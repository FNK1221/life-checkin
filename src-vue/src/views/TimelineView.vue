<template>
  <div class="timeline-view">
    <!-- 搜索框 -->
    <div class="search-wrap-outer">
      <div class="search-wrap">
        <input
          v-model="searchTerm"
          type="text"
          class="search-input"
          placeholder="搜索体验..."
          @input="onSearchInput"
        />
        <button v-if="searchTerm" class="search-clear" @click="clearSearch">✕</button>
      </div>
    </div>

    <!-- 每日推荐卡片 -->
    <div v-if="dailyRecommend && !searchTerm" class="daily-recommend">
      <div class="daily-label">{{ dailyAtm.label }}</div>
      <div class="daily-name">{{ dailyRecommend.name }}</div>
      <div v-if="isDone(dailyRecommend.id)" class="daily-done">✅ 今日已完成打卡</div>
      <template v-else>
        <div class="daily-hint">{{ dailyAtm.hint }}</div>
        <button class="daily-btn" @click="openCheckin(dailyRecommend)">去打卡 ✨</button>
      </template>
    </div>

    <!-- 章节列表 -->

    <!-- 章节列表 -->
    <div v-if="chaptersWithState.length > 0" class="chapter-list">
      <div
        v-for="(item, index) in chaptersWithState"
        :key="item.title + index"
        class="chapter"
        :class="{ open: item.isOpen }"
      >
        <div class="chapter-header" @click="toggleChapter(index)">
          <span class="chapter-icon">{{ item.icon }}</span>
          <div class="chapter-body">
            <div class="chapter-title">{{ item.title }}</div>
            <div class="chapter-sub">{{ item.subtitle }}</div>
          </div>
          <div class="chapter-right">
            <span class="chapter-count">{{ item.done }}/{{ item.total }}</span>
            <span class="chapter-arrow">▼</span>
          </div>
        </div>

        <!-- 事件列表（折叠状态隐藏） -->
        <div v-if="item.isOpen" class="chapter-items">
          <!-- 自定义事件（放在最上面） -->
          <div
            v-for="ce in customEventsInChapter(index)"
            :key="ce.id"
            class="event-item custom-event"
            :class="[
              { checked: isDone(ce.id) },
              { 'hidden-event': isSearching && !matchSearch(ce.id, ce.name) }
            ]"
            @click="handleEventClick({ id: ce.id, name: ce.name, chapter: index, custom: true })"
          >
            <div class="event-check">{{ isDone(ce.id) ? '✓' : '' }}</div>
            <div class="event-info">
              <div class="event-name">{{ ce.name }} <span class="custom-badge">自定义</span></div>
              <div v-if="isDone(ce.id)" class="event-meta">
                <span v-if="getCheckinData(ce.id).date">📅 {{ getCheckinData(ce.id).date }}</span>
                <span v-if="getCheckinData(ce.id).photo" class="meta-clickable" @click="openPhotoViewer(ce.id)">📷 有照片</span>
                <span v-if="getCheckinData(ce.id).note">💬 {{ getCheckinData(ce.id).note.slice(0, 15) }}{{ getCheckinData(ce.id).note.length > 15 ? '…' : '' }}</span>
              </div>
            </div>
            <button class="custom-delete-btn" @click.stop="deleteCustomEvent(ce.id, $event)">✕</button>
          </div>

          <!-- 默认事件 -->
          <div
            v-for="(ev, ei) in item.events"
            :key="index + '-' + ei"
            class="event-item"
            :class="[
              { checked: isDone(index + '-' + ei) },
              { 'hidden-event': isSearching && !matchSearch(index + '-' + ei, ev) }
            ]"
            @click="handleEventClick({ id: index + '-' + ei, name: ev, chapter: index })"
          >
            <div class="event-check">{{ isDone(index + '-' + ei) ? '✓' : '' }}</div>
            <div class="event-info">
              <div class="event-name">{{ ev }}</div>
              <div v-if="isDone(index + '-' + ei)" class="event-meta">
                <span v-if="getCheckinData(index + '-' + ei).date">📅 {{ getCheckinData(index + '-' + ei).date }}</span>
                <span v-if="getCheckinData(index + '-' + ei).photo" class="meta-clickable" @click="openPhotoViewer(index + '-' + ei)">📷 有照片</span>
                <span v-if="getCheckinData(index + '-' + ei).note">💬 {{ getCheckinData(index + '-' + ei).note.slice(0, 15) }}{{ getCheckinData(index + '-' + ei).note.length > 15 ? '…' : '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索无结果 -->
    <div v-if="isSearching && searchMatchedCount === 0" class="search-empty">
      没有找到匹配的体验
    </div>

    <!-- 打卡弹窗 -->
    <CheckinModal
      :visible="showModal"
      :event="currentEvent"
      @close="showModal = false"
      @saved="onCheckinSaved"
    />

    <!-- 打卡仪式弹窗 -->
    <RitualOverlay
      :visible="showRitual"
      :event="ritualEvent"
      @close="onRitualDone"
    />

    <!-- 章节成就弹窗 -->
    <AchievementOverlay
      :visible="showAchievement"
      :chapter-index="achievementChapterIndex"
      @close="onAchievementDone"
    />

    <!-- 图片查看器 -->
    <PhotoViewer
      :visible="showPhotoViewer"
      :event-id="photoEventId"
      @close="onPhotoViewerClose"
    />

    <!-- 自定义事件弹窗 -->
    <CustomEventModal
      :visible="showCustomModal"
      @close="showCustomModal = false"
      @saved="onCustomEventSaved"
    />

    <!-- FAB 按钮（手机端添加自定义事件） -->
    <button v-if="$route.path !== '/stats'" class="fab-btn" @click="showCustomModal = true">＋</button>

    <!-- Toast 通知 -->
    <Transition name="toast">
      <div v-if="toastMsg" class="toast-popup">{{ toastMsg }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CheckinModal from '../components/CheckinModal.vue'
import PhotoViewer from '../components/PhotoViewer.vue'
import CustomEventModal from '../components/CustomEventModal.vue'
import RitualOverlay from '../components/RitualOverlay.vue'
import AchievementOverlay from '../components/AchievementOverlay.vue'
import { CHAPTERS, buildAllEvents } from '../utils/events.js'
import {
  loadCheckinData,
  saveCheckin,
  deleteCheckin,
  loadCustomEvents,
  saveCustomEvents
} from '../utils/storage.js'

// ========== 响应式数据 ==========
const chapters = ref(JSON.parse(JSON.stringify(CHAPTERS)).map(ch => ({ ...ch, isOpen: false })))
const chaptersInitialized = ref(false)
const checkinData = ref({})
const customEvents = ref([])
const showModal = ref(false)
const currentEvent = ref(null)
const searchTerm = ref('')
const isSearching = ref(false)
const searchMatchedCount = ref(0)

// 仪式弹窗 & 成就弹窗
const showRitual = ref(false)
const ritualEvent = ref(null)
const showAchievement = ref(false)
const achievementChapterIndex = ref(-1)

// 每日推荐
const dailyRecommend = ref(null)
const dailyAtm = ref({ label: '', hint: '' })

// 自定义事件弹窗
const showCustomModal = ref(false)

// Toast 通知
const toastMsg = ref('')
let toastTimer = null

// 图片查看器
const showPhotoViewer = ref(false)
const photoEventId = ref('')

// ========== 计算属性 ==========
const doneCount = computed(() => {
  let count = 0
  Object.values(checkinData.value).forEach(d => {
    if (d && d.date) count++ // 有打卡记录
  })
  return count
})

const totalCount = computed(() => {
  let count = 0
  CHAPTERS.forEach(ch => count += ch.events.length)
  count += customEvents.value.length
  return count
})

const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round(doneCount.value / totalCount.value * 100)
})

// 带状态的章节列表（添加 isOpen, done, total）
const chaptersWithState = computed(() => {
  return chapters.value.map((ch, ci) => {
    // 统计默认事件完成数
    let done = 0
    ch.events.forEach((_, ei) => {
      if (checkinData.value[ci + '-' + ei]) done++
    })
    // 统计自定义事件数和完成数
    const ces = customEvents.value.filter(ce => ce.chapterIndex === ci)
    const customDone = ces.filter(ce => checkinData.value[ce.id]).length
    return {
      ...ch,
      done: done + customDone,
      total: ch.events.length + ces.length,
      isOpen: ch.isOpen !== undefined ? ch.isOpen : false
    }
  })
})

// ========== 方法 ==========

// 加载数据 - 保留用户的折叠选择
async function loadData() {
  checkinData.value = await loadCheckinData()
  customEvents.value = loadCustomEvents()

  // 只在新加载时设置 isOpen，后续不再重置
  if (!chaptersInitialized.value) {
    chapters.value = JSON.parse(JSON.stringify(CHAPTERS)).map(ch => ({
      ...ch,
      isOpen: false // 默认折叠
    }))
    chaptersInitialized.value = true
  }
  // 如果 CHAPTERS 有变化（比如新增章节），同步但不重置已有章节的 isOpen
  else {
    const existingTitles = chapters.value.map(c => c.title)
    const newChapters = JSON.parse(JSON.stringify(CHAPTERS)).map((ch, ci) => {
      const existingIdx = existingTitles.indexOf(ch.title)
      if (existingIdx !== -1) {
        // 保留已有章节的 isOpen 状态
        return {
          ...ch,
          isOpen: chapters.value[existingIdx].isOpen
        }
      } else {
        // 新章节，默认折叠
        return {
          ...ch,
          isOpen: false
        }
      }
    })
    chapters.value = newChapters
  }
}

// 打卡状态判断
function isDone(eventId) {
  return !!checkinData.value[eventId]
}

function getCheckinData(eventId) {
  return checkinData.value[eventId] || {}
}

// 切换章节折叠/展开
function toggleChapter(ci) {
  if (!chapters.value[ci]) return
  chapters.value[ci].isOpen = !chapters.value[ci].isOpen
}

// 处理事件点击（已打卡的不重复打卡）
function handleEventClick(event) {
  if (isDone(event.id)) {
    showToast('✓ 已完成打卡，可在「时光轴」中查看回忆')
    return
  }
  currentEvent.value = event
  showModal.value = true
}

// 打开打卡弹窗
function openCheckin(event) {
  currentEvent.value = event
  showModal.value = true
}

// 打卡保存成功 - 不再展开所有章节
async function onCheckinSaved({ eventId, event }) {
  showModal.value = false
  await loadData() // 重新加载数据，但不重置折叠状态

  // 触发打卡仪式
  ritualEvent.value = event
  showRitual.value = true
}

// 仪式弹窗结束
function onRitualDone() {
  showRitual.value = false
  ritualEvent.value = null

  // 检查本章是否全部完成 → 显示成就弹窗
  if (ritualEvent.value && ritualEvent.value.chapter !== undefined) {
    const ci = ritualEvent.value.chapter
    const ch = CHAPTERS[ci]
    if (!ch) return
    // 统计本章完成数
    let done = 0
    ch.events.forEach((_, ei) => {
      if (checkinData.value[ci + '-' + ei]) done++
    })
    const ces = customEvents.value.filter(ce => ce.chapterIndex === ci)
    const customDone = ces.filter(ce => checkinData.value[ce.id]).length
    const total = ch.events.length + ces.length

    if (done + customDone >= total && total > 0) {
      achievementChapterIndex.value = ci
      showAchievement.value = true
    }
  }
}

// 成就弹窗结束
function onAchievementDone() {
  showAchievement.value = false
  achievementChapterIndex.value = -1
}

// 打开图片查看器
function openPhotoViewer(eventId) {
  photoEventId.value = eventId
  showPhotoViewer.value = true
}

// 关闭图片查看器
function onPhotoViewerClose() {
  showPhotoViewer.value = false
  photoEventId.value = ''
}

// 自定义事件保存成功
function onCustomEventSaved() {
  showCustomModal.value = false
  showToast('✅ 自定义体验已添加')
  loadData()
}

// Toast 通知
function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer)
  toastMsg.value = msg
  toastTimer = setTimeout(() => {
    toastMsg.value = ''
  }, 2200)
}

// 删除自定义事件
function deleteCustomEvent(eventId, event) {
  if (event) { event.stopPropagation(); event.preventDefault() }
  if (!confirm('确定删除该自定义打卡事件？已打卡的记录也会被删除。')) return
  // 从 customEvents 中移除
  customEvents.value = customEvents.value.filter(ce => ce.id !== eventId)
  // 从 checkinData 中移除
  delete checkinData.value[eventId]
  // 保存
  saveCustomEvents(customEvents.value)
  saveCheckin(eventId, null) // 这里需要删除，不是保存
  // 重新加载
  loadData()
  showToast('自定义打卡已删除')
}

// 获取某章节的自定义事件
function customEventsInChapter(ci) {
  return customEvents.value.filter(ce => ce.chapterIndex === ci)
}

// ========== 搜索 ==========
let searchTimer = null

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    isSearching.value = !!searchTerm.value.trim()
    // 不再自动展开所有章节 - 用户手动控制折叠/展开
    searchMatchedCount.value = 0
    // 计算匹配数量
    if (isSearching.value) {
      const term = searchTerm.value.trim().toLowerCase()
      let count = 0
      CHAPTERS.forEach((ch, ci) => {
        ch.events.forEach((ev, ei) => {
          if (ev.toLowerCase().includes(term)) count++
        })
      })
      customEvents.value.forEach(ce => {
        if (ce.name.toLowerCase().includes(term)) count++
      })
      searchMatchedCount.value = count
    }
  }, 300)
}

function clearSearch() {
  searchTerm.value = ''
  isSearching.value = false
  searchMatchedCount.value = 0
}

function matchSearch(eventId, name) {
  if (!isSearching.value) return true
  const term = searchTerm.value.trim().toLowerCase()
  return name.toLowerCase().includes(term)
}

// ========== 每日推荐（简化版，后续完善）==========
function pickDailyRecommend() {
  // 随机选一个未完成的事件
  const all = buildAllEvents(customEvents.value)
  const undone = all.filter(ev => !checkinData.value[ev.id])
  if (undone.length === 0) return null
  return undone[Math.floor(Math.random() * undone.length)].id
}

function getRecommendAtmosphere() {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 10) return { label: '🌅 晨光里', hint: '清晨的阳光，适合开始新的体验' }
  if (hour >= 10 && hour < 14) return { label: '☀️ 正午时', hint: '午后时光，记录当下的心情' }
  if (hour >= 14 && hour < 18) return { label: '🌤️ 下午茶', hint: '悠闲午后，给自己一个打卡的理由' }
  if (hour >= 18 && hour < 22) return { label: '🌇 夕阳下', hint: '傍晚时分，回首今天的收获' }
  return { label: '🌙 夜色中', hint: '夜深人静，想想今天完成了什么' }
}

// 初始化每日推荐
function initDailyRecommend() {
  const recId = pickDailyRecommend()
  if (!recId) return
  const all = buildAllEvents(customEvents.value)
  const recEv = all.find(ev => ev.id === recId)
  if (recEv) {
    dailyRecommend.value = recEv
    dailyAtm.value = getRecommendAtmosphere()
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
  initDailyRecommend()
})
</script>

<style scoped>
.timeline-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 16px;
}

/* ========== 头部进度 ========== */
.timeline-header {
  margin-bottom: 32px;
}

.progress-section {
  background: var(--card, #fff);
  border-radius: var(--radius-lg, 20px);
  padding: 20px;
  box-shadow: var(--shadow, 0 2px 16px rgba(0,0,0,0.06));
}

.progress-bar {
  height: 8px;
  background: var(--accent, #f5f7fa);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary, #4A90D9), #6AB0FF);
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-muted, #8C8C9A);
}

.progress-percent {
  font-weight: 700;
  color: var(--primary, #4A90D9);
  font-size: 18px;
}

/* ========== 章节列表 ========== */
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chapter {
  background: var(--card, #fff);
  border-radius: var(--radius, 12px);
  box-shadow: var(--shadow, 0 2px 16px rgba(0,0,0,0.06));
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.chapter:hover {
  box-shadow: var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.10));
}

.chapter-header {
  display: flex;
  align-items: center;
  padding: 15px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.chapter-header:hover {
  background: var(--accent, #f5f7fa);
}

.chapter-icon {
  font-size: 22px;
  margin-right: 11px;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}

.chapter-body {
  flex: 1;
  min-width: 0;
}

.chapter-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text, #1A1A2E);
  line-height: 1.3;
}

.chapter-sub {
  font-size: 11px;
  color: var(--text-muted, #8C8C9A);
  margin-top: 2px;
}

.chapter-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 8px;
}

.chapter-count {
  font-size: 12px;
  color: var(--primary, #4A90D9);
  font-weight: 600;
  background: var(--accent, #f5f7fa);
  padding: 2px 9px;
  border-radius: 20px;
}

.chapter-arrow {
  font-size: 11px;
  color: var(--text-muted, #8C8C9A);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

.chapter.open .chapter-arrow {
  transform: rotate(180deg);
}

.chapter-items {
  padding: 0 10px 10px;
}

/* ========== 事件列表 ========== */
.event-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 10px;
  border-radius: var(--radius-sm, 10px);
  margin-bottom: 4px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.event-item:hover {
  background: var(--accent, #f5f7fa);
}

.event-item:active {
  transform: scale(0.985);
}

.event-item.checked {
  opacity: 0.7;
}

.event-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2.2px solid var(--border, #E8ECF0);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  margin-top: 1px;
  transition: all 0.3s;
  font-size: 13px;
  background: var(--card, #fff);
}

.event-item.checked .event-check {
  background: var(--primary, #4A90D9);
  border-color: var(--primary, #4A90D9);
  color: #fff;
  box-shadow: 0 2px 8px rgba(74, 144, 217, 0.35);
}

.event-info {
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}

.event-name {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text, #1A1A2E);
}

.event-item.checked .event-name {
  color: var(--text-muted, #8C8C9A);
  text-decoration: line-through;
  text-decoration-color: var(--border, #E8ECF0);
  text-decoration-thickness: 1.5px;
}

.event-meta {
  font-size: 11px;
  color: var(--text-muted, #8C8C9A);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.hidden-event {
  display: none;
}

.custom-badge {
  display: inline-block;
  font-size: 10px;
  background: var(--accent2, #f5d8c5);
  color: var(--primary, #c47a5e);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
  font-weight: 500;
}

.custom-event {
  position: relative;
}

.custom-delete-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(255, 77, 79, 0.1);
  color: var(--danger, #FF4D4F);
  border-radius: 50%;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.custom-event:hover .custom-delete-btn {
  opacity: 1;
}

/* ========== 搜索 ========== */
.search-wrap {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 14px;
  border: 1px solid var(--border, #E8ECF0);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg, #FAFBFC);
  color: var(--text, #1A1A2E);
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--primary, #4A90D9);
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-muted, #8C8C9A);
  font-size: 12px;
}

.search-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted, #8C8C9A);
  font-size: 14px;
}

/* 搜索框外层（在去打卡下面） */
.search-wrap-outer {
  padding: 0 0 16px 0;
  animation: searchFadeIn 0.4s ease both;
}

.search-wrap {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

@keyframes searchFadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========== 每日推荐 ========== */
.daily-recommend {
  background: linear-gradient(135deg, var(--primary, #c47a5e), var(--primary-light, #d4957a));
  border-radius: var(--radius-lg, 20px);
  padding: 20px;
  margin-bottom: 24px;
  color: #fff;
  box-shadow: 0 4px 20px rgba(196, 122, 94, 0.3);
}

.daily-label {
  font-size: 12px;
  opacity: 0.8;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.daily-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.4;
}

.daily-hint {
  font-size: 13px;
  opacity: 0.7;
  margin-bottom: 12px;
}

.daily-done {
  font-size: 14px;
  opacity: 0.9;
}

.daily-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.daily-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ========== Toast 动画 ========== */
.toast-enter-active { animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-leave-active { animation: toastOut 0.3s ease-in forwards; }

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); }
  to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  to { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); }
}</style>
