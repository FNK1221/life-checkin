<template>
  <Teleport to="body">
    <Transition name="achieve">
      <div v-if="visible" class="achievement-overlay" @click.self="onClose">
        <div class="achievement-card">
          <div class="achievement-icon">{{ icon }}</div>
          <div class="achievement-title">🎊 {{ effectName }}</div>
          <div class="achievement-sub">「{{ chapterTitle }}」的所有经历都已打卡，太了不起！</div>
          <button class="achievement-btn" @click="onClose">继续探索 ✨</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { CHAPTERS } from '../utils/events.js'

const props = defineProps({
  visible: Boolean,
  chapterIndex: Number
})

const emit = defineEmits(['close'])

const icon = ref('🎊')
const effectName = ref('')
const chapterTitle = ref('')

// 每个章节完成时的专属特效
const CHAPTER_ACHIEVEMENT_EFFECTS = {
  0: { emojis: ['🌸','🏵️','💮','🪷','🌺'], name:'花瓣飘落' },
  1: { emojis: ['📚','📖','🎓','✏️','📝'], name:'书香满屋' },
  2: { emojis: ['💼','🚀','📈','💡','🏆'], name:'星光闪耀' },
  3: { emojis: ['❤️','💕','💖','💗','🥰'], name:'爱心飞扬' },
  4: { emojis: ['🏠','🍳','🪴','🕯️','🧺'], name:'温馨家居' },
  5: { emojis: ['🌍','✈️','🗺️','⛵️','🏝️'], name:'星辰大海' },
  6: { emojis: ['🎉','🎊','🪅','🎆','✨'], name:'烟花绽放' },
  7: { emojis: ['🕰️','💎','🌟','📜','🦉'], name:'智慧之光' }
}

function show() {
  const ch = CHAPTERS[props.chapterIndex]
  if (!ch) return

  const effect = CHAPTER_ACHIEVEMENT_EFFECTS[props.chapterIndex]
  icon.value = ch.icon
  effectName.value = effect ? effect.name : '章节圆满完成！'
  chapterTitle.value = ch.title

  // 根据章节使用不同特效
  if (props.chapterIndex === 0) {
    spawnStars(18, ['🌸','🏵️','💮','🪷','🌺'])
  } else if (props.chapterIndex === 6) {
    spawnStars(12, effect ? effect.emojis : null)
    setTimeout(() => spawnStars(8, ['🎆','🎇','✨']), 400)
  } else {
    spawnStars(12, effect ? effect.emojis : null)
  }
}

function onClose() {
  emit('close')
}

function spawnStars(count, emojis) {
  const items = emojis || ['⭐','🌟','✨','💫','⚡','🔆']
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div')
      el.className = 'achievement-star'
      el.textContent = items[Math.floor(Math.random() * items.length)]
      el.style.left = centerX + 'px'
      el.style.top = centerY + 'px'
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const dist = 80 + Math.random() * 120
      el.style.setProperty('--sx', Math.cos(angle) * dist + 'px')
      el.style.setProperty('--sy', Math.sin(angle) * dist + 'px')
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 1200)
    }, i * 60)
  }
}

// 监听 visible 变化，显示时触发特效
watch(() => props.visible, (val) => {
  if (val) show()
})
</script>

<style scoped>
.achievement-overlay {
  position: fixed;
  inset: 0;
  background: rgba(62, 45, 35, 0.6);
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.achievement-card {
  background: var(--card);
  border-radius: 24px;
  padding: 44px 30px 32px;
  text-align: center;
  max-width: 340px;
  width: 85%;
  animation: achievePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 16px 50px rgba(0,0,0,0.2);
  position: relative;
  overflow: hidden;
}

@keyframes achievePop {
  from { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.05); }
  to { transform: scale(1); opacity: 1; }
}

.achievement-icon {
  font-size: 56px;
  margin-bottom: 16px;
  animation: achieveBounce 0.8s ease 0.3s both;
}

@keyframes achieveBounce {
  0% { transform: scale(0) rotate(-20deg); }
  60% { transform: scale(1.3) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.achievement-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
}

.achievement-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 22px;
  line-height: 1.6;
}

.achievement-btn {
  padding: 12px 36px;
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

.achievement-btn:active { transform: scale(0.96); }

/* 星星粒子 */
.achievement-star {
  position: fixed;
  z-index: 4001;
  pointer-events: none;
  font-size: 22px;
  animation: starFly 1s ease-out forwards;
}

@keyframes starFly {
  0% { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(0); }
}

/* 弹窗动画 */
.achieve-enter-active,
.achieve-leave-active {
  transition: opacity 0.3s;
}
.achieve-enter-from,
.achieve-leave-to {
  opacity: 0;
}
</style>
