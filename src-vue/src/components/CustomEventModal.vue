<template>
  <Teleport to="body">
    <Transition name="custom">
      <div v-if="visible" class="custom-modal" @click.self="$emit('close')">
        <div class="custom-card">
          <div class="custom-title">✨ 新建自定义体验</div>
          <div class="custom-subtitle">为人生添加专属的体验项目</div>

          <div class="custom-form">
            <label class="custom-label">📝 体验名称</label>
            <input
              v-model="form.name"
              class="custom-input"
              placeholder="例如：学习插花、完成马拉松…"
              maxlength="30"
            />

            <label class="custom-label">📂 所属章节</label>
            <select v-model="form.chapterIndex" class="custom-select">
              <option disabled value="-1">请选择章节…</option>
              <option v-for="(ch, ci) in CHAPTERS" :key="ci" :value="ci">
                {{ ch.icon }} {{ ch.title }}
              </option>
            </select>
          </div>

          <div class="custom-actions">
            <button class="custom-cancel" @click="$emit('close')">取消</button>
            <button class="custom-save" @click="save">保存体验</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { CHAPTERS } from '../utils/events.js'
import { loadCustomEvents, saveCustomEvents } from '../utils/storage.js'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'saved'])

const form = ref({
  name: '',
  chapterIndex: -1
})

function reset() {
  form.value = { name: '', chapterIndex: -1 }
}

async function save() {
  if (!form.value.name.trim()) {
    alert('⚠️ 请输入体验名称')
    return
  }
  if (form.value.chapterIndex < 0) {
    alert('⚠️ 请选择所属章节')
    return
  }

  const newEvent = {
    id: 'custom_' + Date.now(),
    name: form.value.name.trim(),
    chapterIndex: form.value.chapterIndex,
    createdAt: new Date().toISOString()
  }

  const list = loadCustomEvents()
  list.push(newEvent)
  saveCustomEvents(list)

  reset()
  emit('saved')
  emit('close')
}

// 监听 visible 变化，打开时重置表单
import { watch } from 'vue'
watch(() => props.visible, (val) => {
  if (val) reset()
})
</script>

<style scoped>
.custom-modal {
  position: fixed;
  inset: 0;
  background: rgba(62, 45, 35, 0.5);
  z-index: 3000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(3px);
}
@media (min-width: 641px) {
  .custom-modal { align-items: center; }
}

.custom-card {
  background: var(--card);
  border-radius: 22px 22px 0 0;
  width: 100%;
  max-width: 420px;
  padding: 28px 20px 36px;
  animation: customPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-overflow-scrolling: touch;
}
@media (min-width: 641px) {
  .custom-card { border-radius: 22px; }
}
@keyframes customPop {
  from { transform: translateY(100%); opacity: 0.8; }
  to { transform: translateY(0); opacity: 1; }
}

.custom-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
  margin-bottom: 6px;
}
.custom-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 22px;
  line-height: 1.5;
}

.custom-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.custom-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}
.custom-input,
.custom-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: var(--bg);
  color: var(--text);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.custom-input:focus,
.custom-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}
.custom-select { cursor: pointer; }

.custom-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
.custom-cancel {
  flex: 1;
  padding: 11px 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  color: var(--text-muted);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}
.custom-cancel:active { background: var(--accent); }
.custom-save {
  flex: 1;
  padding: 11px 0;
  border: none;
  border-radius: 12px;
  background: linear-gradient(145deg, var(--primary-light), var(--primary-dark));
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(196, 122, 94, 0.3);
  transition: transform 0.1s;
}
.custom-save:active { transform: scale(0.96); }

/* 动画 */
.custom-enter-active,
.custom-leave-active { transition: opacity 0.3s; }
.custom-enter-from,
.custom-leave-to { opacity: 0; }
</style>
