<template>
  <div class="sky-section" :class="{ 'dark-mode': isDark }">
    <!-- 天空背景 -->
    <div class="sky-background"></div>

    <!-- 白天：太阳 + 云朵 + 小鸟 -->
    <template v-if="!isDark">
      <!-- 太阳（可点击切换夜晚） -->
      <button class="sun-moon-toggle sun" @click="toggleTheme" title="切换夜晚">
        <div class="sun-rays"></div>
        <div class="sun-core"></div>
      </button>

      <!-- 小鸟（点击显示名言） -->
      <button class="sky-bird" @click="showQuote" title="点击听听它的话">
        <svg viewBox="0 0 40 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 16 Q12 8, 20 12 Q26 8, 30 14 Q32 16, 30 18 Q24 20, 18 18 Q12 22, 8 16Z" fill="#5A4A3A"/>
          <circle cx="26" cy="14" r="2" fill="#FFF"/>
          <circle cx="26.5" cy="13.5" r="0.8" fill="#333"/>
          <path d="M30 14 L36 12 L34 16Z" fill="#E8A030"/>
          <path d="M16 18 Q14 24, 18 26 Q20 24, 18 18Z" fill="#7A6A5A"/>
          <path d="M22 18 Q24 24, 20 26 Q18 24, 20 18Z" fill="#7A6A5A"/>
          <path d="M12 14 Q8 10, 10 8 Q12 10, 14 12Z" fill="#5A4A3A"/>
        </svg>
        <div class="bird-speech-hint">?</div>
      </button>

      <!-- 云朵 -->
      <div class="day-clouds">
        <div class="cloud cloud-1">
          <div class="cloud-puff"></div>
          <div class="cloud-puff"></div>
          <div class="cloud-puff"></div>
        </div>
        <div class="cloud cloud-2">
          <div class="cloud-puff"></div>
          <div class="cloud-puff"></div>
          <div class="cloud-puff"></div>
          <div class="cloud-puff"></div>
        </div>
        <div class="cloud cloud-3">
          <div class="cloud-puff"></div>
          <div class="cloud-puff"></div>
          <div class="cloud-puff"></div>
        </div>
        <div class="cloud cloud-4">
          <div class="cloud-puff"></div>
          <div class="cloud-puff"></div>
          <div class="cloud-puff"></div>
        </div>
      </div>
    </template>

    <!-- 夜晚：月亮 + 星星 + 流星 + 显眼星星 -->
    <template v-if="isDark">
      <!-- 月亮（可点击切换白天） -->
      <button class="sun-moon-toggle moon" @click="toggleTheme" title="切换白天">
        <div class="moon-body"></div>
        <div class="moon-crater c1"></div>
        <div class="moon-crater c2"></div>
        <div class="moon-crater c3"></div>
        <div class="moon-glow"></div>
      </button>

      <!-- 显眼星星（点击显示名言） -->
      <button class="sky-wish-star" @click="showQuote" title="点击许个愿">
        <div class="wish-star-core"></div>
        <div class="wish-star-glow"></div>
        <div class="wish-star-rays"></div>
      </button>

      <!-- 星星 -->
      <div class="night-stars">
        <div
          v-for="star in stars"
          :key="star.id"
          class="star"
          :style="star.style"
        ></div>
      </div>

      <!-- 流星 -->
      <div class="meteor-container">
        <div
          v-for="meteor in meteors"
          :key="meteor.id"
          class="shooting-star"
          :style="meteor.style"
        ></div>
      </div>
    </template>

    <!-- 进度显示（圆形水滴状） -->
    <div class="progress-bubble">
      <div class="progress-ring-outer">
        <div class="progress-ring-inner">
          <div class="progress-number">{{ progressPercent }}<span class="percent-sign">%</span></div>
          <div class="progress-label">{{ doneCount }} / {{ totalCount }}</div>
        </div>
      </div>
      <!-- 小水滴装饰 -->
      <div class="bubble-drop drop-1"></div>
      <div class="bubble-drop drop-2"></div>
    </div>

    <!-- 名言弹窗（虚化背景高级效果） -->
    <Transition name="quote">
      <div v-if="showQuoteModal" class="quote-overlay" @click.self="closeQuote">
        <div class="quote-blur-bg"></div>
        <div class="quote-card">
          <div class="quote-glow"></div>
          <div class="quote-icon">{{ currentQuote.icon }}</div>
          <div class="quote-category">{{ currentQuote.cat }}</div>
          <div class="quote-text" v-html="currentQuote.q.replace(/\n/g, '<br>')"></div>
          <div class="quote-source">—— {{ currentQuote.src }}</div>
          <button class="quote-btn" @click="closeQuote">知道了</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  doneCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 }
})

const isDark = ref(false)
const stars = ref([])
const meteors = ref([])
const showQuoteModal = ref(false)
const currentQuote = ref({ icon: '◆', cat: '人生哲理', q: '每一次仰望天空，都是与自己的对话。', src: '天空寄语' })

let starId = 0
let meteorId = 0
let meteorTimer = null

// 名言库
const SKY_QUOTES = [
  { cat: '人生哲理', icon: '◆', q: '每一次仰望天空，都是与自己的对话。\n云卷云舒，唯心自明。', src: '天空寄语' },
  { cat: '人生哲理', icon: '◆', q: '人生如行云流水，\n不必执着于停留，也不必惧怕漂泊。', src: '云语' },
  { cat: '关心父母', icon: '◆', q: '父母在，人生尚有来处；\n父母去，人生只剩归途。\n今天，给他们打个电话吧。', src: '作家毕淑敏' },
  { cat: '关心父母', icon: '◆', q: '你养我小，我养你老。\n时间不等人，爱要趁现在说出口。', src: '人间真实' },
  { cat: '关心父母', icon: '◆', q: '世间最美好的事，\n不过是：你已长大，他们还未老。', src: '温情语录' },
  { cat: '关心父母', icon: '◆', q: '树欲静而风不止，子欲养而亲不待。\n别等失去后才懂得珍惜。', src: '《孔子家语》' },
  { cat: '关心父母', icon: '◆', q: '谁言寸草心，报得三春晖。\n父母之恩，此生难报，唯有常伴左右。', src: '孟郊' },
  { cat: '关心父母', icon: '◆', q: '父母的白发，是你不在的日子里，\n时光偷偷写下的笔记。\n多回家看看吧。', src: '人间清醒' },
  { cat: '爱自己', icon: '◆', q: '你不必是一朵玫瑰，\n做一棵小草也很好。\n万物皆有它的季节。', src: '自我疗愈' },
  { cat: '爱自己', icon: '◆', q: '允许自己偶尔不想努力，\n允许自己有段时间只是发呆。\n你不是机器，你是人。', src: '温柔自语' },
  { cat: '爱自己', icon: '◆', q: '先照顾好自己，\n才能温柔对待这个世界。', src: '心理学的邀请' },
  { cat: '爱自己', icon: '◆', q: '身体发肤，受之父母，不敢毁伤。\n好好吃饭，好好睡觉，是对自己最大的负责。', src: '《孝经》' },
  { cat: '爱自己', icon: '◆', q: '你若盛开，清风自来。\n不必讨好世界，先成为自己的光。', src: '致自己' },
  { cat: '修德品行', icon: '◆', q: '人为善，福虽未至，祸已远离；\n人为恶，祸虽未至，福已远离。', src: '《了凡四训》' },
  { cat: '修德品行', icon: '◆', q: '静坐常思己过，闲谈莫论人非。\n能受苦方为志士，肯吃亏不是痴人。', src: '《格言联璧》' },
  { cat: '修德品行', icon: '◆', q: '吾日三省吾身：\n为人谋而不忠乎？\n与朋友交而不信乎？传不习乎？', src: '《论语》' },
  { cat: '修德品行', icon: '◆', q: '勿以恶小而为之，勿以善小而不为。\n惟贤惟德，能服于人。', src: '刘备' },
  { cat: '修德品行', icon: '◆', q: '上善若水，水善利万物而不争。\n处众人之所恶，故几于道。', src: '《道德经》' },
  { cat: '修德品行', icon: '◆', q: '天行健，君子以自强不息；\n地势坤，君子以厚德载物。', src: '《易经》' },
  { cat: '加油打气', icon: '◆', q: '你正在走的这条路，\n也许泥泞，但每一步都算数。\n别急，花会开的。', src: '给正在努力的你' },
  { cat: '加油打气', icon: '◆', q: '所有的光鲜亮丽，\n背后都是无人问津的坚持。\n你已经很棒了。', src: '致奋斗中的你' },
  { cat: '加油打气', icon: '◆', q: '生活原本沉闷，\n但跑起来就有风。\n今天的风，特别好。', src: '人生打气筒' },
  { cat: '加油打气', icon: '◆', q: '山再高，往上攀，总能登顶；\n路再远，走下去，定能到达。', src: '《人民日报》' },
  { cat: '加油打气', icon: '◆', q: '你现在做的事，\n也许暂时看不到光，\n但请相信：功不唐捐。', src: '《醒世恒言》' },
  { cat: '人生哲理', icon: '◆', q: '读过的书、走过的路、\n爱过的人，就是你的人生。\n不必和别人比，你的节奏刚刚好。', src: '生活家' },
  { cat: '人生哲理', icon: '◆', q: '一花一世界，一叶一菩提。\n平凡处，最是动人。', src: '禅语' },
  { cat: '人生哲理', icon: '◆', q: '人生如茶，苦后回甘。\n此刻的平静，便是圆满。', src: '茶禅一味' }
]

function showQuote() {
  const pick = SKY_QUOTES[Math.floor(Math.random() * SKY_QUOTES.length)]
  currentQuote.value = pick
  showQuoteModal.value = true
}

function closeQuote() {
  showQuoteModal.value = false
}

// 检测主题
function updateTheme() {
  isDark.value = document.documentElement.classList.contains('dark-theme')
}

// 切换主题
function toggleTheme() {
  const html = document.documentElement
  const dark = html.classList.contains('dark-theme')

  html.classList.add('theme-transitioning')
  setTimeout(() => html.classList.remove('theme-transitioning'), 500)

  if (dark) {
    html.classList.remove('dark-theme')
    localStorage.setItem('lifeCheckinTheme', 'light')
  } else {
    html.classList.add('dark-theme')
    localStorage.setItem('lifeCheckinTheme', 'dark')
  }

  // 重新生成星星/流星
  setTimeout(() => {
    updateTheme()
    generateStars()
    if (isDark.value) scheduleMeteor()
    else if (meteorTimer) { clearTimeout(meteorTimer); meteorTimer = null }
  }, 100)
}

// 生成星星
function generateStars() {
  if (!isDark.value) { stars.value = []; return }
  const count = 20 + Math.floor(Math.random() * 10)
  const newStars = []
  for (let i = 0; i < count; i++) {
    const id = ++starId
    const size = 1.5 + Math.random() * 3
    newStars.push({
      id,
      style: {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        width: size + 'px',
        height: size + 'px',
        '--dur': (1.2 + Math.random() * 2.8) + 's',
        '--delay': (Math.random() * 3.5) + 's',
        '--o1': (0.25 + Math.random() * 0.35).toFixed(2),
        '--o2': (0.65 + Math.random() * 0.35).toFixed(2),
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)`
      }
    })
  }
  stars.value = newStars
}

// 流星调度
function scheduleMeteor() {
  if (!isDark.value) return
  const delay = 8000 + Math.random() * 12000
  meteorTimer = setTimeout(() => {
    createMeteor()
    scheduleMeteor()
  }, delay)
}

function createMeteor() {
  const id = ++meteorId
  const len = 40 + Math.random() * 60
  const dur = (0.6 + Math.random() * 0.4).toFixed(2)
  meteors.value.push({
    id,
    style: {
      left: (50 + Math.random() * 50) + '%',
      top: (Math.random() * 30) + '%',
      width: len + 'px',
      height: '1.5px',
      '--meteor-dur': dur + 's',
      background: `linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9) 60%, #fff)`,
      borderRadius: '1px'
    }
  })
  setTimeout(() => { meteors.value = meteors.value.filter(m => m.id !== id) }, 1200)
}

// 监听主题变化
const observer = new MutationObserver(() => {
  updateTheme()
  generateStars()
})

const progressPercent = computed(() => {
  if (props.totalCount === 0) return 0
  return Math.round(props.doneCount / props.totalCount * 100)
})

onMounted(() => {
  updateTheme()
  generateStars()
  scheduleMeteor()
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  observer.disconnect()
  if (meteorTimer) clearTimeout(meteorTimer)
})
</script>

<style scoped>
.sky-section {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  border-radius: 0 0 24px 24px;
  margin-bottom: 20px;
}

/* ========== 天空背景 ========== */
.sky-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #6BB3E0 0%, #A8D8EA 50%, #D4F0F7 100%);
  transition: background 0.6s ease;
}

.dark-mode .sky-background {
  background: linear-gradient(180deg, #070720 0%, #12123A 50%, #1E1E4A 100%);
}

/* ========== 太阳/月亮切换按钮 ========== */
.sun-moon-toggle {
  position: absolute;
  top: 16px;
  right: 20px;
  width: 48px;
  height: 48px;
  border: none;
  background: none;
  cursor: pointer;
  z-index: 20;
  padding: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sun-moon-toggle:hover {
  transform: scale(1.15) rotate(10deg);
}

.sun-moon-toggle:active {
  transform: scale(0.95);
}

/* 太阳 */
.sun .sun-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  margin: -14px 0 0 -14px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FFF9E6, #FFD54F 40%, #FF8F00 100%);
  box-shadow:
    0 0 20px rgba(255, 213, 79, 0.5),
    0 0 40px rgba(255, 213, 79, 0.2),
    inset 0 -2px 4px rgba(255, 143, 0, 0.3);
  animation: sunPulse 3s ease-in-out infinite;
}

.sun .sun-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg, rgba(255, 213, 79, 0.15) 10deg, transparent 20deg,
    transparent 45deg, rgba(255, 213, 79, 0.15) 55deg, transparent 65deg,
    transparent 90deg, rgba(255, 213, 79, 0.15) 100deg, transparent 110deg,
    transparent 135deg, rgba(255, 213, 79, 0.15) 145deg, transparent 155deg,
    transparent 180deg, rgba(255, 213, 79, 0.15) 190deg, transparent 200deg,
    transparent 225deg, rgba(255, 213, 79, 0.15) 235deg, transparent 245deg,
    transparent 270deg, rgba(255, 213, 79, 0.15) 280deg, transparent 290deg,
    transparent 315deg, rgba(255, 213, 79, 0.15) 325deg, transparent 335deg
  );
  animation: sunRotate 20s linear infinite;
}

@keyframes sunPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 213, 79, 0.5), 0 0 40px rgba(255, 213, 79, 0.2), inset 0 -2px 4px rgba(255, 143, 0, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 213, 79, 0.6), 0 0 60px rgba(255, 213, 79, 0.3), inset 0 -2px 4px rgba(255, 143, 0, 0.3); }
}

@keyframes sunRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 月亮 */
.moon .moon-body {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  margin: -15px 0 0 -15px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FFFEF0, #F5F0D8 50%, #E0D8B8 100%);
  box-shadow:
    0 0 20px rgba(255, 254, 240, 0.3),
    0 0 40px rgba(255, 254, 240, 0.1),
    inset -3px -2px 6px rgba(180, 170, 140, 0.3);
}

.moon .moon-crater {
  position: absolute;
  border-radius: 50%;
  background: rgba(180, 170, 140, 0.25);
  box-shadow: inset 1px 1px 2px rgba(160, 150, 120, 0.3);
}

.moon .moon-crater.c1 { width: 6px; height: 6px; top: 14px; right: 12px; }
.moon .moon-crater.c2 { width: 4px; height: 4px; top: 24px; left: 14px; }
.moon .moon-crater.c3 { width: 5px; height: 5px; top: 20px; right: 16px; }

.moon .moon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  margin: -25px 0 0 -25px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 254, 240, 0.08), transparent 70%);
  animation: moonGlow 4s ease-in-out infinite;
}

@keyframes moonGlow {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 0.3; }
}

/* ========== 白天云朵 ========== */
.day-clouds {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cloud {
  position: absolute;
  pointer-events: none;
  opacity: 0.55;
  filter: blur(0.5px);
}

.cloud-puff {
  position: absolute;
  background: radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.95), rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%);
  border-radius: 50%;
}

.cloud-1 { top: 18px; left: 70px; width: 60px; height: 28px; animation: cloudFloat1 8s ease-in-out infinite; }
.cloud-1 .cloud-puff:nth-child(1) { width: 28px; height: 22px; top: 6px; left: 4px; }
.cloud-1 .cloud-puff:nth-child(2) { width: 34px; height: 26px; top: 2px; left: 16px; }
.cloud-1 .cloud-puff:nth-child(3) { width: 24px; height: 20px; top: 8px; left: 36px; }

.cloud-2 { top: 12px; right: 60px; width: 80px; height: 34px; animation: cloudFloat2 10s ease-in-out infinite; }
.cloud-2 .cloud-puff:nth-child(1) { width: 34px; height: 26px; top: 8px; left: 6px; }
.cloud-2 .cloud-puff:nth-child(2) { width: 42px; height: 30px; top: 2px; left: 22px; }
.cloud-2 .cloud-puff:nth-child(3) { width: 30px; height: 24px; top: 6px; left: 48px; }
.cloud-2 .cloud-puff:nth-child(4) { width: 20px; height: 18px; top: 12px; left: 64px; }

.cloud-3 { bottom: 38px; left: 20px; width: 50px; height: 22px; animation: cloudFloat3 9s ease-in-out infinite; opacity: 0.4; }
.cloud-3 .cloud-puff:nth-child(1) { width: 22px; height: 18px; top: 4px; left: 2px; }
.cloud-3 .cloud-puff:nth-child(2) { width: 28px; height: 20px; top: 1px; left: 14px; }
.cloud-3 .cloud-puff:nth-child(3) { width: 20px; height: 16px; top: 5px; left: 32px; }

.cloud-4 { bottom: 42px; right: 16px; width: 70px; height: 30px; animation: cloudFloat4 11s ease-in-out infinite; opacity: 0.45; }
.cloud-4 .cloud-puff:nth-child(1) { width: 30px; height: 24px; top: 6px; left: 4px; }
.cloud-4 .cloud-puff:nth-child(2) { width: 38px; height: 28px; top: 1px; left: 20px; }
.cloud-4 .cloud-puff:nth-child(3) { width: 26px; height: 20px; top: 8px; left: 46px; }

@keyframes cloudFloat1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(8px, -4px); }
}
@keyframes cloudFloat2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-10px, 5px); }
}
@keyframes cloudFloat3 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(6px, 3px); }
}
@keyframes cloudFloat4 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-7px, -3px); }
}

/* ========== 夜晚星星 ========== */
.night-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  pointer-events: none;
  z-index: 2;
  animation: starTwinkle var(--dur, 2s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

@keyframes starTwinkle {
  0%, 100% { opacity: var(--o1, 0.3); transform: scale(1); }
  50% { opacity: var(--o2, 0.95); transform: scale(1.25); }
}

/* ========== 流星 ========== */
.meteor-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shooting-star {
  position: absolute;
  pointer-events: none;
  opacity: 0;
  animation: shootingStarFly var(--meteor-dur, 0.6s) ease-out forwards;
}

@keyframes shootingStarFly {
  0% { opacity: 0; transform: translate(0, 0) rotate(-30deg); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translate(-150px, 80px) rotate(-30deg) scale(0.3); }
}

/* ========== 进度水滴 ========== */
.progress-bubble {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.progress-ring-outer {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.15);
  animation: bubbleFloat 4s ease-in-out infinite;
}

.dark-mode .progress-ring-outer {
  background: rgba(26, 26, 46, 0.35);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

.progress-ring-inner {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.dark-mode .progress-ring-inner {
  background: rgba(30, 30, 50, 0.45);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.05);
}

.progress-number {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.percent-sign {
  font-size: 14px;
  font-weight: 500;
  margin-left: 1px;
}

.progress-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 4px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 小水滴装饰 */
.bubble-drop {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
}

.drop-1 {
  width: 14px;
  height: 14px;
  top: -6px;
  right: 4px;
  animation: dropFloat1 3s ease-in-out infinite;
}

.drop-2 {
  width: 10px;
  height: 10px;
  bottom: 8px;
  left: -4px;
  animation: dropFloat2 3.5s ease-in-out infinite;
}

@keyframes bubbleFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6px); }
}

@keyframes dropFloat1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(3px, -4px); }
}

@keyframes dropFloat2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-2px, 3px); }
}

/* ========== 响应式 ========== */
@media (max-width: 640px) {
  .sky-section {
    height: 220px;
    border-radius: 0 0 20px 20px;
  }

  .sun-moon-toggle {
    width: 40px;
    height: 40px;
    top: 12px;
    right: 14px;
  }

  .sun .sun-core { width: 22px; height: 22px; margin: -11px 0 0 -11px; }
  .sun .sun-rays { width: 36px; height: 36px; margin: -18px 0 0 -18px; }
  .moon .moon-body { width: 24px; height: 24px; margin: -12px 0 0 -12px; }

  .progress-ring-outer { width: 90px; height: 90px; }
  .progress-ring-inner { width: 74px; height: 74px; }
  .progress-number { font-size: 22px; }
  .percent-sign { font-size: 11px; }
  .progress-label { font-size: 10px; }

  .cloud-1 { top: 14px; left: 58px; width: 42px; height: 20px; }
  .cloud-2 { top: 10px; right: 50px; width: 56px; height: 24px; }
  .cloud-3 { bottom: 32px; left: 8px; width: 36px; height: 16px; }
  .cloud-4 { bottom: 36px; right: 8px; width: 48px; height: 21px; }
}

/* ========== 白天小鸟 ========== */
.sky-bird {
  position: absolute;
  top: 60px;
  left: 20%;
  width: 44px;
  height: 36px;
  border: none;
  background: none;
  cursor: pointer;
  z-index: 15;
  padding: 0;
  animation: birdFly 12s ease-in-out infinite;
  transition: transform 0.3s;
}

.sky-bird:hover {
  transform: scale(1.2);
}

.sky-bird svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

.bird-speech-hint {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  color: var(--primary, #c47a5e);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  animation: birdHintPulse 2s ease-in-out infinite;
}

@keyframes birdFly {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  20% { transform: translate(30px, -8px) rotate(2deg); }
  40% { transform: translate(60px, 4px) rotate(-1deg); }
  60% { transform: translate(40px, -4px) rotate(1deg); }
  80% { transform: translate(10px, 6px) rotate(-2deg); }
}

@keyframes birdHintPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.8; }
}

/* ========== 夜晚显眼星星 ========== */
.sky-wish-star {
  position: absolute;
  top: 50px;
  left: 25%;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  z-index: 15;
  padding: 0;
  animation: wishStarFloat 4s ease-in-out infinite;
  transition: transform 0.3s;
}

.sky-wish-star:hover {
  transform: scale(1.25);
}

.wish-star-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: radial-gradient(circle, #FFFEF0, #FFD700);
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.6), 0 0 24px rgba(255, 215, 0, 0.3);
}

.wish-star-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  margin: -15px 0 0 -15px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.15), transparent 70%);
  animation: wishStarGlow 2s ease-in-out infinite;
}

.wish-star-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg, rgba(255, 215, 0, 0.2) 15deg, transparent 30deg,
    transparent 60deg, rgba(255, 215, 0, 0.2) 75deg, transparent 90deg,
    transparent 120deg, rgba(255, 215, 0, 0.2) 135deg, transparent 150deg,
    transparent 180deg, rgba(255, 215, 0, 0.2) 195deg, transparent 210deg,
    transparent 240deg, rgba(255, 215, 0, 0.2) 255deg, transparent 270deg,
    transparent 300deg, rgba(255, 215, 0, 0.2) 315deg, transparent 330deg
  );
  animation: wishStarRotate 8s linear infinite;
}

@keyframes wishStarFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes wishStarGlow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

@keyframes wishStarRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ========== 名言弹窗 ========== */
.quote-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.quote-blur-bg {
  position: absolute;
  inset: 0;
  background: rgba(10, 8, 18, 0.5);
  backdrop-filter: blur(24px) saturate(1.3);
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
  animation: quoteFadeIn 0.4s ease;
}

@keyframes quoteFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.quote-card {
  position: relative;
  background: linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(250,248,245,0.96) 100%);
  border-radius: 28px;
  padding: 48px 36px 40px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow:
    0 28px 90px rgba(0,0,0,0.2),
    0 0 0 1px rgba(255,255,255,0.5),
    inset 0 1px 0 rgba(255,255,255,0.8);
  overflow: hidden;
  animation: quotePop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
}

.dark-mode .quote-card {
  background: linear-gradient(160deg, rgba(38,36,56,0.96) 0%, rgba(30,28,48,0.96) 100%);
  box-shadow:
    0 28px 90px rgba(0,0,0,0.4),
    0 0 0 1px rgba(255,255,255,0.06),
    inset 0 1px 0 rgba(255,255,255,0.05);
}

@keyframes quotePop {
  from { transform: scale(0.7) translateY(40px); opacity: 0; }
  60%  { transform: scale(1.02) translateY(-4px); }
  to   { transform: scale(1) translateY(0); opacity: 1; }
}

.quote-glow {
  position: absolute;
  top: -60px;
  right: -40px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(196,122,94,0.12), transparent 70%);
  pointer-events: none;
  animation: quoteGlowPulse 3s ease-in-out infinite;
}

@keyframes quoteGlowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.quote-icon {
  font-size: 32px;
  margin-bottom: 16px;
  color: var(--primary, #c47a5e);
  animation: quoteIconIn 0.6s ease 0.15s both;
  line-height: 1;
}

@keyframes quoteIconIn {
  from { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.15); }
  to   { transform: scale(1); opacity: 1; }
}

.quote-category {
  display: inline-block;
  font-size: 11px;
  color: var(--primary, #c47a5e);
  background: rgba(196,122,94,0.1);
  padding: 4px 14px;
  border-radius: 20px;
  margin-bottom: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.quote-text {
  font-size: 17px;
  font-weight: 600;
  color: var(--text, #1A1A2E);
  line-height: 1.9;
  margin-bottom: 20px;
  letter-spacing: 0.3px;
}

.quote-source {
  font-size: 12px;
  color: var(--text-muted, #8C8C9A);
  margin-bottom: 28px;
  font-style: italic;
  opacity: 0.8;
}

.quote-btn {
  padding: 12px 40px;
  background: linear-gradient(145deg, var(--primary-light, #d4957a), var(--primary-dark, #a35e42));
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(196,122,94,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: 0.5px;
}

.quote-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(196,122,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
}

.quote-btn:active {
  transform: translateY(0) scale(0.97);
}

/* 弹窗过渡 */
.quote-enter-active,
.quote-leave-active {
  transition: opacity 0.3s ease;
}
.quote-enter-from,
.quote-leave-to {
  opacity: 0;
}

/* ========== 响应式 ========== */
@media (max-width: 640px) {
  .sky-section {
    height: 220px;
    border-radius: 0 0 20px 20px;
  }

  .sun-moon-toggle {
    width: 40px;
    height: 40px;
    top: 12px;
    right: 14px;
  }

  .sun .sun-core { width: 22px; height: 22px; margin: -11px 0 0 -11px; }
  .sun .sun-rays { width: 36px; height: 36px; margin: -18px 0 0 -18px; }
  .moon .moon-body { width: 24px; height: 24px; margin: -12px 0 0 -12px; }

  .sky-bird { width: 36px; height: 30px; top: 50px; }
  .sky-wish-star { width: 34px; height: 34px; top: 42px; }

  .progress-ring-outer { width: 90px; height: 90px; }
  .progress-ring-inner { width: 74px; height: 74px; }
  .progress-number { font-size: 22px; }
  .percent-sign { font-size: 11px; }
  .progress-label { font-size: 10px; }

  .quote-card { padding: 36px 24px 32px; border-radius: 24px; }
  .quote-text { font-size: 15px; }

  .cloud-1 { top: 14px; left: 58px; width: 42px; height: 20px; }
  .cloud-2 { top: 10px; right: 50px; width: 56px; height: 24px; }
  .cloud-3 { bottom: 32px; left: 8px; width: 36px; height: 16px; }
  .cloud-4 { bottom: 36px; right: 8px; width: 48px; height: 21px; }
}

@media (max-width: 380px) {
  .sky-section { height: 200px; }
  .cloud-1 { left: 50px; width: 36px; height: 17px; }
  .cloud-2 { right: 40px; width: 46px; height: 20px; }
  .cloud-3, .cloud-4 { display: none; }
}
</style>
