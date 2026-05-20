<template>
  <Teleport to="body">
    <Transition name="pv">
      <div v-if="visible" class="photo-viewer" @click="onClose">
        <img :src="src" alt="打卡照片" class="pv-img" />
        <div class="pv-hint">点击任意位置关闭</div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getMediaForEvent } from '../utils/storage.js'

const props = defineProps({
  visible: Boolean,
  eventId: String
})

const emit = defineEmits(['close'])

const src = ref('')
let objectURL = null

async function loadPhoto(eventId) {
  if (!eventId) return
  try {
    const result = await getMediaForEvent(eventId, 'photo')
    if (result && result.blob) {
      if (objectURL) URL.revokeObjectURL(objectURL)
      objectURL = URL.createObjectURL(result.blob)
      src.value = objectURL
    }
  } catch (e) {
    console.warn('加载照片失败', e)
  }
}

function onClose() {
  emit('close')
}

// 监听 visible + eventId，显示时加载照片
watch(
  () => [props.visible, props.eventId],
  ([visible, eventId]) => {
    if (visible && eventId) {
      loadPhoto(eventId)
    } else if (!visible) {
      // 关闭时释放 URL
      if (objectURL) {
        URL.revokeObjectURL(objectURL)
        objectURL = null
        src.value = ''
      }
    }
  }
)
</script>

<style scoped>
.photo-viewer {
  position: fixed;
  inset: 0;
  background: rgba(30, 20, 15, 0.95);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(8px);
  cursor: pointer;
}
.pv-img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 10px;
  object-fit: contain;
}
.pv-hint {
  position: absolute;
  bottom: 40px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  pointer-events: none;
}

/* 动画 */
.pv-enter-active,
.pv-leave-active {
  transition: opacity 0.25s;
}
.pv-enter-from,
.pv-leave-to {
  opacity: 0;
}
</style>
