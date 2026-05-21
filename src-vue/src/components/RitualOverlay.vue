<template>
  <Teleport to="body">
    <Transition name="ritual">
      <div v-if="visible" class="ritual-overlay" @click.self="onClose">
        <div class="ritual-card">
          <div class="ritual-icon">{{ icon }}</div>
          <div class="ritual-quote">{{ quote }}</div>
          <div class="ritual-event">📌 {{ eventName }}</div>
          <button class="ritual-btn" @click="onClose">继续 ✨</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  event: Object
})

const emit = defineEmits(['close'])

const RITUAL_QUOTES = [
  '✨ 每一个当下的选择，都是生命的礼物',
  '🌱 你在认真生活，这本身就很了不起',
  '💫 这一刻，宇宙也为你鼓掌',
  '📋 把瞬间变成永恒，你做到了',
  '🌸 人生没有白走的路，每一步都算数',
  '🪷 轻如花瓣，却重若人生',
  '📋 记录，是对生命最深情的告白',
  '🍃 一片叶子有一片叶子的命运，你记录了你的',
  '🌸 花开一瞬，你记住了一生',
  '📋 风会带走声音，但带不走你的记录',
  '✨ 今天的你，值得被明天记住',
  '🪷 清净的心，记录不清净的繁华',
  '📋 生命的厚度，在于你记住了多少',
  '🌙 夜深了，但这一刻永远亮着',
  '🍂 落叶知秋，你知自己',
  '💮 不必完美，只需真实',
  '📋 一枝一叶总关情',
  '🌾 人生如穗，低头时最饱满',
  '🪨 坚硬的石头也会记住水滴',
  '📋 风铃响起时，你在心里又活了一次'
]

const RITUAL_ICONS = ['🌸','📋','🪷','✨','💫','📐','🪶','🌾']

const quote = ref('')
const icon = ref('')

function spawnPetals(count) {
  const petalEmojis = ['🌸','🏵️','💮','🪷','🌺','✿']
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div')
      el.className = 'petal'
      el.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)]
      el.style.left = Math.random() * 100 + 'vw'
      el.style.top = '-30px'
      el.style.fontSize = (16 + Math.random() * 14) + 'px'
      el.style.animationDuration = (2.5 + Math.random() * 2) + 's'
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 5000)
    }, i * 80)
  }
}

function onOpen() {
  const qIdx = Math.floor(Math.random() * RITUAL_QUOTES.length)
  const iIdx = Math.floor(Math.random() * RITUAL_ICONS.length)
  quote.value = RITUAL_QUOTES[qIdx]
  icon.value = RITUAL_ICONS[iIdx]
  spawnPetals(18)
}

function onClose() {
  emit('close')
}

// 监听 visible 变化
watch(() => props.visible, (val) => {
  if (val) onOpen()
})
</script>

<style scoped>
.ritual-overlay {
  position: fixed;
  inset: 0;
  background: rgba(62, 45, 35, 0.55);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
}
.ritual-card {
  background: var(--card);
  border-radius: 24px;
  padding: 40px 32px 32px;
  text-align: center;
  max-width: 360px;
  width: 88%;
  animation: ritualPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  position: relative;
  overflow: hidden;
}
@keyframes ritualPop {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.ritual-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: ritualBounce 0.6s ease 0.3s both;
}
@keyframes ritualBounce {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.ritual-quote {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  line-height: 1.7;
  margin-bottom: 12px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ritual-event {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
  padding: 10px 16px;
  background: var(--accent);
  border-radius: 10px;
  line-height: 1.5;
}
.ritual-btn {
  padding: 12px 40px;
  background: linear-gradient(145deg, var(--primary-light), var(--primary-dark));
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(196, 122, 94, 0.3);
  transition: transform 0.1s;
  -webkit-tap-highlight-color: transparent;
}
.ritual-btn:active { transform: scale(0.96); }

/* 花瓣飘落 */
.petal {
  position: fixed;
  z-index: 3001;
  pointer-events: none;
  font-size: 20px;
  animation: petalFall linear forwards;
}
@keyframes petalFall {
  0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
  80%  { opacity: 0.8; }
  100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
}

/* 弹窗动画 */
.ritual-enter-active,
.ritual-leave-active {
  transition: opacity 0.3s;
}
.ritual-enter-from,
.ritual-leave-to {
  opacity: 0;
}
</style>
