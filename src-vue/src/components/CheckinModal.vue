<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-card">
          <!-- 头部 -->
          <div class="modal-header">
            <h3>{{ event?.name || '打卡' }}</h3>
            <button class="modal-close" @click="$emit('close')">✕</button>
          </div>

          <!-- 表单 -->
          <div class="modal-body">
            <!-- 日期 -->
            <div class="form-group">
              <label class="form-label">📅 日期</label>
              <input
                v-model="form.date"
                type="date"
                class="form-input"
              />
            </div>

            <!-- 我想说 -->
            <div class="form-group">
              <label class="form-label">💬 我想说（可选）</label>
              <textarea
                v-model="form.note"
                class="form-textarea"
                placeholder="记录这一刻的感受..."
                rows="3"
              ></textarea>
            </div>

            <!-- 照片 -->
            <div class="form-group">
              <label class="form-label">📷 照片（可选，最大 5MB）</label>
              <input
                type="file"
                accept="image/*"
                class="form-input"
                @change="onPhotoChange"
              />
              <div v-if="photoPreview" class="preview-box">
                <img :src="photoPreview" alt="预览" class="preview-img" />
                <button class="remove-btn" @click="removePhoto">✕</button>
              </div>
              <div v-if="photoCompressing" class="compressing-tip">⏳ 正在压缩照片...</div>
            </div>

            <!-- 音频 -->
            <div class="form-group">
              <label class="form-label">🎵 音频（可选，最大 10MB）</label>
              <input
                type="file"
                accept="audio/*"
                class="form-input"
                @change="onAudioChange"
              />
              <div v-if="audioName" class="file-name">{{ audioName }}</div>
            </div>

            <!-- 视频 -->
            <div class="form-group">
              <label class="form-label">🎬 视频（可选，最大 20MB）</label>
              <input
                type="file"
                accept="video/*"
                class="form-input"
                @change="onVideoChange"
              />
              <div v-if="videoName" class="file-name">{{ videoName }}</div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="$emit('close')">取消</button>
            <button class="btn btn-primary" @click="save" :disabled="saving">
              {{ saving ? '保存中...' : '完成打卡' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { compressImage, saveCheckin, saveMedia } from '../utils/storage.js'

const props = defineProps({
  visible: Boolean,
  event: Object
})

const emit = defineEmits(['close', 'saved'])

// 表单数据
const form = reactive({
  date: new Date().toISOString().split('T')[0],
  note: ''
})

const photoFile = ref(null)
const photoPreview = ref('')
const photoCompressing = ref(false)
const audioFile = ref(null)
const audioName = ref('')
const videoFile = ref(null)
const videoName = ref('')

// 监听弹窗显示，重置表单
watch(() => props.visible, (val) => {
  if (val) {
    resetForm()
  }
})

function resetForm() {
  form.date = new Date().toISOString().split('T')[0]
  form.note = ''
  photoFile.value = null
  photoPreview.value = ''
  photoCompressing.value = false
  audioFile.value = null
  audioName.value = ''
  videoFile.value = null
  videoName.value = ''
}

// ========== 照片 ==========
async function onPhotoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('⚠️ 照片不能超过 5MB')
    return
  }

  photoCompressing.value = true
  try {
    const blob = await compressImage(file, 600, 0.65)
    photoFile.value = blob
    photoPreview.value = URL.createObjectURL(blob)
  } catch (err) {
    alert('⚠️ 照片压缩失败')
  } finally {
    photoCompressing.value = false
  }
}

function removePhoto() {
  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value)
  }
  photoFile.value = null
  photoPreview.value = ''
}

// ========== 音频 ==========
function onAudioChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    alert('⚠️ 音频不能超过 10MB')
    return
  }
  audioFile.value = file
  audioName.value = file.name
}

// ========== 视频 ==========
function onVideoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 20 * 1024 * 1024) {
    alert('⚠️ 视频不能超过 20MB')
    return
  }
  videoFile.value = file
  videoName.value = file.name
}

// ========== 保存 ==========
const saving = ref(false)

async function save() {
  if (!props.event || saving.value) return
  saving.value = true

  const eventId = props.event.id
  const data = {
    date: form.date,
    photo: !!photoFile.value,
    hasAudio: !!audioFile.value,
    hasVideo: !!videoFile.value,
    note: form.note,
    timestamp: Date.now()
  }

  try {
    // 保存打卡数据（localStorage）
    await saveCheckin(eventId, data)

    // 保存照片（IndexedDB）
    if (photoFile.value) {
      await saveMedia(eventId, 'photo', photoFile.value, 'photo_' + Date.now() + '.jpg')
    }

    // 保存音频（IndexedDB）
    if (audioFile.value) {
      await saveMedia(eventId, 'audio', audioFile.value, audioFile.value.name)
    }

    // 保存视频（IndexedDB）
    if (videoFile.value) {
      await saveMedia(eventId, 'video', videoFile.value, videoFile.value.name)
    }

    // 返回事件信息，供父组件触发仪式/成就弹窗
    emit('saved', {
      eventId,
      event: props.event
    })
  } finally {
    saving.value = false
  }
}

// ========== 清理 Object URL ==========
onUnmounted(() => {
  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(62, 45, 35, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-card {
  background: var(--card, #fff);
  border-radius: 22px 22px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 88vh;
  overflow-y: auto;
  padding: 28px 20px 36px;
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-overflow-scrolling: touch;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0.8; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border, #e0e0e0);
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text, #333);
  line-height: 1.4;
}

.modal-close {
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

.modal-close:hover {
  background: var(--border, #e0e0e0);
}

.modal-body {
  padding: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text, #333);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 8px 0;
  font-size: 14px;
  color: var(--text, #333);
}

.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  background: var(--bg, #fafafa);
  color: var(--text, #333);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-textarea:focus {
  border-color: var(--primary, #4A90D9);
  box-shadow: 0 0 0 3px var(--primary-light, #E8F4FD);
}

.preview-box {
  position: relative;
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compessing-tip {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-muted, #666);
}

.file-name {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-muted, #666);
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border, #e0e0e0);
  margin-top: 20px;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--border, #e0e0e0);
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--card, #fff);
  color: var(--text-muted, #666);
}

.btn-cancel:hover {
  background: var(--accent, #f5f5f5);
}

.btn-primary {
  background: var(--primary, #4A90D9);
  color: white;
  border-color: var(--primary, #4A90D9);
}

.btn-primary:hover {
  opacity: 0.9;
}

/* ========== 动画 ========== */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from .modal-card {
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to .modal-card {
  transform: scale(0.95) translateY(10px);
}
</style>
