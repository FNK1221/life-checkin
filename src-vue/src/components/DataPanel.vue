<template>
  <div class="data-panel-overlay" v-if="visible" @click.self="$emit('close')">
    <div class="data-panel">
      <div class="panel-header">
        <h3>📊 数据管理</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="panel-body">
        <div class="stat-item">
          <span class="stat-label">总打卡数</span>
          <span class="stat-value">{{ totalCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">存储占用</span>
          <span class="stat-value">{{ storageSize }}</span>
        </div>
        <button class="action-btn danger" @click="handleClearOld">🗑️ 清理旧数据</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  visible: Boolean
})

defineEmits(['close'])

const totalCount = ref(0)
const storageSize = ref('计算中...')

onMounted(() => {
  // TODO: 从 Dexie.js 读取实际数据
  totalCount.value = 0
  storageSize.value = '0 KB'
})
</script>

<style scoped>
.data-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.data-panel {
  background: var(--card, #fff);
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text, #333);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-secondary, #666);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--accent, #f5f5f5);
}

.panel-body {
  padding: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.stat-label {
  color: var(--text-secondary, #666);
  font-size: 14px;
}

.stat-value {
  color: var(--text, #333);
  font-weight: 600;
  font-size: 16px;
}

.action-btn {
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 10px;
  background: var(--card, #fff);
  color: var(--text, #333);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.danger {
  color: #e74c3c;
  border-color: #e74c3c;
}

.action-btn.danger:hover {
  background: #e74c3c;
  color: #fff;
}
</style>
