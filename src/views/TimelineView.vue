<script setup>
import { ref, onMounted, computed } from 'vue'
import CheckinModal from '@/components/CheckinModal.vue'
import DataPanel from '@/components/DataPanel.vue'

const showCheckinModal = ref(false)
const showDataPanel = ref(false)
const currentEvent = ref(null)

function openCheckin(evt) {
  currentEvent.value = evt
  showCheckinModal.value = true
}

function closeCheckinModal() {
  showCheckinModal.value = false
}
</script>

<template>
  <div class="app-container">
    <!— 顶部导航 —>
    <header class="app-header">
      <h1 class="app-title">人生体验卡</h1>
      <button class="data-btn" @click="showDataPanel = true">📊 数据</button>
    </header>

    <!— 进度条 —>
    <section class="progress-section">
      <!— 进度条组件后续迁移 —>
    </section>

    <!— 时光轴列表 —>
    <main class="timeline-container">
      <!— 虚拟滚动列表后续实现 —>
    </main>

    <!— 打卡弹窗 —>
    <CheckinModal
      :visible="showCheckinModal"
      :event="currentEvent"
      @close="closeCheckinModal"
    />

    <!— 数据管理面板 —>
    <DataPanel
      :visible="showDataPanel"
      @close="showDataPanel = false"
    />
  </div>
</template>

<style scoped>
.app-container {
  max-width: 420px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg);
  padding: 16px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.app-title {
  font-size: 20px;
  color: var(--primary);
  font-weight: 700;
}
</style>
