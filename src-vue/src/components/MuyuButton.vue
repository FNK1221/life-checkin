<template>
  <!-- 木鱼按钮：进度圈左侧 -->
  <div class="muyu-by-progress">
    <button
      class="muyu-btn-svg"
      :class="{ tapping }"
      @click="clickMuyu"
      title="敲木鱼"
    >
      <!-- 木鱼 SVG -->
      <svg class="muyu-svg" viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="muyuWood" cx="42%" cy="28%" r="62%">
            <stop offset="0%" stop-color="#f0d8a8"/>
            <stop offset="18%" stop-color="#d4a860"/>
            <stop offset="40%" stop-color="#b08830"/>
            <stop offset="65%" stop-color="#8b6914"/>
            <stop offset="100%" stop-color="#4a2a08"/>
          </radialGradient>
          <radialGradient id="muyuTopHighlight" cx="38%" cy="20%" r="48%">
            <stop offset="0%" stop-color="rgba(255,245,220,0.55)"/>
            <stop offset="55%" stop-color="rgba(255,240,200,0.15)"/>
            <stop offset="100%" stop-color="rgba(255,240,200,0)"/>
          </radialGradient>
          <linearGradient id="muyuSlit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3a1a00"/>
            <stop offset="35%" stop-color="#1a0800"/>
            <stop offset="65%" stop-color="#1a0800"/>
            <stop offset="100%" stop-color="#3a1a00"/>
          </linearGradient>
          <radialGradient id="muyuMouth" cx="50%" cy="60%" r="40%">
            <stop offset="0%" stop-color="#5a3010"/>
            <stop offset="100%" stop-color="#3a1800"/>
          </radialGradient>
          <radialGradient id="muyuEye" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stop-color="#2a1000"/>
            <stop offset="100%" stop-color="#1a0800"/>
          </radialGradient>
          <filter id="woodTexture" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.7" numOctaves="3" seed="5" result="noise"/>
            <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
            <feComponentTransfer in="gray" result="contrast">
              <feFuncR type="linear" slope="1.8" intercept="-0.2"/>
            </feComponentTransfer>
            <feComposite in="SourceGraphic" in2="contrast" operator="arithmetic" k1="0.92" k2="0.08" k3="0" k4="0"/>
          </filter>
          <filter id="softGlow">
            <feDropShadow dx="0" dy="1" stdDeviation="0.8" flood-color="#f0d8a8" flood-opacity="0.3"/>
          </filter>
        </defs>
        <ellipse cx="40" cy="68" rx="22" ry="3" fill="rgba(40,15,0,0.18)"/>
        <path d="M40 6 C22 6, 10 18, 8 34 Q6 44, 10 54 Q16 64, 40 66 Q64 64, 70 54 Q74 44, 72 34 Q70 18, 58 6 Q50 6, 40 6Z"
              fill="url(#muyuWood)" stroke="#3a1a00" stroke-width="1.2" filter="url(#woodTexture)"/>
        <path d="M24 14 Q40 8, 56 14" fill="none" stroke="rgba(60,30,5,0.25)" stroke-width="1.2"/>
        <path d="M20 22 Q40 16, 60 22" fill="none" stroke="rgba(60,30,5,0.18)" stroke-width="0.8"/>
        <ellipse cx="26" cy="32" rx="4.5" ry="3.5" fill="url(#muyuEye)" stroke="#2a1000" stroke-width="0.6"/>
        <ellipse cx="25" cy="31" rx="1.8" ry="1.3" fill="#1a0800" opacity="0.7"/>
        <ellipse cx="26.5" cy="30.5" rx="0.8" ry="0.6" fill="rgba(255,240,200,0.35)"/>
        <ellipse cx="54" cy="32" rx="4.5" ry="3.5" fill="url(#muyuEye)" stroke="#2a1000" stroke-width="0.6"/>
        <ellipse cx="53" cy="31" rx="1.8" ry="1.3" fill="#1a0800" opacity="0.7"/>
        <ellipse cx="54.5" cy="30.5" rx="0.8" ry="0.6" fill="rgba(255,240,200,0.35)"/>
        <path d="M28 28 Q34 24, 40 28" fill="none" stroke="rgba(60,30,5,0.13)" stroke-width="0.5"/>
        <path d="M40 28 Q46 24, 52 28" fill="none" stroke="rgba(60,30,5,0.13)" stroke-width="0.5"/>
        <path d="M30 38 Q38 34, 42 38" fill="none" stroke="rgba(60,30,5,0.11)" stroke-width="0.5"/>
        <path d="M38 38 Q46 34, 50 38" fill="none" stroke="rgba(60,30,5,0.11)" stroke-width="0.5"/>
        <path d="M30 40 Q38 42, 42 40" fill="none" stroke="rgba(60,30,5,0.09)" stroke-width="0.4"/>
        <path d="M22 42 Q40 52, 58 42" fill="none" stroke="rgba(60,30,5,0.2)" stroke-width="0.8"/>
        <path d="M30 39.5 Q40 49, 50 39.5" fill="none" stroke="rgba(255,230,180,0.35)" stroke-width="0.6"/>
        <path d="M30 40 Q40 50, 50 40 Q48 44, 40 46 Q32 44, 30 40Z" fill="url(#muyuSlit)" stroke="#1a0800" stroke-width="0.5" opacity="0.92"/>
        <path d="M22 16 Q40 10, 58 16 Q56 22, 40 20 Q24 22, 22 16Z" fill="url(#muyuTopHighlight)"/>
        <ellipse cx="56" cy="20" rx="6" ry="3" fill="rgba(255,245,220,0.15)" transform="rotate(-15 56 20)"/>
        <rect x="37" y="66" width="6" height="4" rx="1.5" fill="#6b4a10" opacity="0.75"/>
        <path d="M37 68 Q40 70, 43 68" fill="none" stroke="#4a2a08" stroke-width="0.6" opacity="0.5"/>
      </svg>
      <!-- 木槌 -->
      <svg class="muyu-mallet" :class="{ tapping }" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="malletHead" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e8c880"/>
            <stop offset="30%" stop-color="#c9a050"/>
            <stop offset="70%" stop-color="#8b6914"/>
            <stop offset="100%" stop-color="#5a3a0a"/>
          </linearGradient>
          <radialGradient id="malletHighlight" cx="35%" cy="30%" r="45%">
            <stop offset="0%" stop-color="rgba(255,245,220,0.5)"/>
            <stop offset="100%" stop-color="rgba(255,245,220,0)"/>
          </radialGradient>
          <linearGradient id="malletHandle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#c9a050"/>
            <stop offset="100%" stop-color="#7a5a20"/>
          </linearGradient>
        </defs>
        <line x1="32" y1="4" x2="20" y2="28" stroke="url(#malletHandle)" stroke-width="2.8" stroke-linecap="round"/>
        <rect x="8" y="2" width="18" height="14" rx="5" fill="url(#malletHead)" stroke="#5a3a0a" stroke-width="0.6"/>
        <rect x="10" y="4" width="14" height="10" rx="4" fill="url(#malletHighlight)" opacity="0.6"/>
      </svg>
    </button>

    <!-- 木鱼点击次数（隐藏） -->
    <div class="muyu-click-count" style="display:none !important;">{{ clickCount }}</div>
  </div>

  <!-- 花瓣容器（Teleport 到 body） -->
  <Teleport to="body">
    <div
      v-for="p in petals"
      :key="p.id"
      class="petal"
      :style="p.style"
    >{{ p.emoji }}</div>
  </Teleport>

  <!-- 涟漪容器（Teleport 到 body） -->
  <Teleport to="body">
    <div
      v-for="r in ripples"
      :key="r.id"
      class="muyu-ripple"
      :style="r.style"
    ></div>
  </Teleport>

  <!-- 哲学弹窗 -->
  <Transition name="phil">
    <div v-if="showPhilosophy" class="phil-overlay" @click.self="closePhilosophy">
      <div class="phil-card">
        <div class="phil-icon">{{ currentQuote.icon }}</div>
        <div class="phil-category">{{ currentQuote.cat }}</div>
        <div class="phil-quote" v-html="currentQuote.q.replace(/\n/g, '<br>')"></div>
        <div class="phil-source">—— {{ currentQuote.src }}</div>
        <button class="phil-btn" @click="closePhilosophy">感恩当下 ✨</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const emit = defineEmits(['tap'])

const tapping = ref(false)
const clickCount = ref(0)
const petals = ref([])
const ripples = ref([])
const showPhilosophy = ref(false)
const currentQuote = ref({ icon: '🪷', cat: '人生哲理', q: '每一次敲击，都是与自己的对话。', src: '禅语' })

// 名言库（与原始版本一致）
const MUYU_QUOTES = [
  { cat: '人生哲理', icon: '🪷', q: '每一次敲击，都是与自己的对话。\n木鱼声声，唯心自明。', src: '禅语' },
  { cat: '人生哲理', icon: '🍃', q: '人生如茶，苦后回甘。\n此刻的平静，便是圆满。', src: '茶禅一味' },
  { cat: '人生哲理', icon: '🪨', q: '山不辞土，故能成其高；\n海不辞水，故能成其深。', src: '《管子》' },
  { cat: '人生哲理', icon: '🌊', q: '人生海海，山山而川。\n不必慌张，每一步都算数。', src: '人生哲思' },
  { cat: '人生哲理', icon: '🕯️', q: '静坐常思己过，\n闲谈莫论人非。', src: '《菜根谭》' },
  { cat: '人生哲理', icon: '🌿', q: '一花一世界，一叶一菩提。\n平凡处，最是动人。', src: '禅语' },
  { cat: '关心父母', icon: '🏠', q: '父母在，人生尚有来处；\n父母去，人生只剩归途。\n今天，给他们打个电话吧。', src: '作家毕淑敏' },
  { cat: '关心父母', icon: '☎️', q: '你养我小，我养你老。\n时间不等人，爱要趁现在说出口。', src: '人间真实' },
  { cat: '关心父母', icon: '🫖', q: '世间最美好的事，\n不过是：你已长大，他们还未老。', src: '温情语录' },
  { cat: '爱自己', icon: '💗', q: '你不必是一朵玫瑰，\n做一棵小草也很好。\n万物皆有它的季节。', src: '自我疗愈' },
  { cat: '爱自己', icon: '🌙', q: '允许自己偶尔不想努力，\n允许自己有段时间只是发呆。\n你不是机器，你是人。', src: '温柔自语' },
  { cat: '爱自己', icon: '🫂', q: '先照顾好自己，\n才能温柔对待这个世界。', src: '心理学的邀请' },
  { cat: '加油打气', icon: '🌟', q: '你正在走的这条路，\n也许泥泞，但每一步都算数。\n别急，花会开的。', src: '给正在努力的你' },
  { cat: '加油打气', icon: '🚀', q: '所有的光鲜亮丽，\n背后都是无人问津的坚持。\n你已经很棒了。', src: '致奋斗中的你' },
  { cat: '加油打气', icon: '🌈', q: '生活原本沉闷，\n但跑起来就有风。\n今天的风，特别好。', src: '人生打气筒' },
  { cat: '加油打气', icon: '🔥', q: '你现在做的事，\n也许暂时看不到光，\n但请相信：功不唐捐。', src: '《醒世恒言》' },
  { cat: '人生哲理', icon: '📖', q: '读过的书、走过的路、\n爱过的人，就是你的人生。\n不必和别人比，你的节奏刚刚好。', src: '生活家' },
  { cat: '爱自己', icon: '🎐', q: '学会说"不"，\n是你送给自己的最好的礼物。', src: '边界感' },
  { cat: '关心父母', icon: '🧓', q: '父母的白发，是你不在的日子里，\n时光偷偷写下的笔记。\n多回家看看吧。', src: '人间清醒' },
  { cat: '加油打气', icon: '⛰️', q: '山再高，往上攀，总能登顶；\n路再远，走下去，定能到达。', src: '《人民日报》' }
]

let petalId = 0
let rippleId = 0
let philosophyTimer = null

function clickMuyu(e) {
  // 播放木鱼音效
  playMuyuSound()

  // 涟漪
  if (e) {
    createRipple(e.clientX, e.clientY)
  }

  // 木槌敲击动画
  tapping.value = false
  void document.body.offsetWidth // 强制重绘
  tapping.value = true
  setTimeout(() => { tapping.value = false }, 350)

  // 随机花瓣
  spawnPetals(3 + Math.floor(Math.random() * 4))

  // 显示哲学弹窗
  setTimeout(() => { showPhilosophyPopup() }, 300)

  emit('tap')
}

function playMuyuSound() {
  try {
    const audio = new Audio()
    // 使用短促的"咚"声（用 AudioContext 合成）
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15)
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  } catch (e) {
    // 静默失败
  }
}

function spawnPetals(count) {
  const petalEmojis = ['🌸', '🏵️', '💮', '🪷', '🌺', '✿']
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const id = ++petalId
      const emoji = petalEmojis[Math.floor(Math.random() * petalEmojis.length)]
      const left = Math.random() * 100
      const size = 16 + Math.random() * 14
      const duration = 2.5 + Math.random() * 2
      petals.value.push({
        id,
        emoji,
        style: {
          left: left + 'vw',
          top: '-30px',
          fontSize: size + 'px',
          animationDuration: duration + 's',
          animationDelay: '0s'
        }
      })
      // 5秒后移除
      setTimeout(() => {
        petals.value = petals.value.filter(p => p.id !== id)
      }, 5000)
    }, i * 80)
  }
}

function createRipple(x, y) {
  const id = ++rippleId
  const size = 30 + Math.random() * 20
  ripples.value.push({
    id,
    style: {
      left: (x - size / 2) + 'px',
      top: (y - size / 2) + 'px',
      width: size + 'px',
      height: size + 'px',
      animation: 'muyuRipple 0.5s ease-out forwards'
    }
  })
  setTimeout(() => {
    ripples.value = ripples.value.filter(r => r.id !== id)
  }, 600)
}

function showPhilosophyPopup() {
  const pick = MUYU_QUOTES[Math.floor(Math.random() * MUYU_QUOTES.length)]
  currentQuote.value = pick
  showPhilosophy.value = true
}

function closePhilosophy() {
  showPhilosophy.value = false
}

onBeforeUnmount(() => {
  if (philosophyTimer) clearTimeout(philosophyTimer)
})
</script>

<style scoped>
  /* ========== MUYU BUTTON ========== */
  .muyu-by-progress {
    position: absolute;
    left: max(6px, calc(50% - 155px));
    top: 92px;
    z-index: 101;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .muyu-btn-svg {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: radial-gradient(circle at 38% 32%, rgba(255,220,160,0.35) 0%, transparent 55%),
                linear-gradient(160deg, #c9a050 0%, #a07830 25%, #7a5a18 55%, #5a3a0a 100%);
    box-shadow:
      0 4px 16px rgba(80,40, 5, 0.40),
      0 1px 3px rgba(80,40, 5, 0.25),
      inset 0 2px 4px rgba(255,220,140,0.35),
      inset 0 -3px 6px rgba(40,20, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.08s;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    overflow: visible;
  }
  .muyu-btn-svg:active,
  .muyu-btn-svg.tapping {
    transform: scale(0.92);
  }

  .muyu-svg {
    width: 50px;
    height: 44px;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
    position: relative;
    z-index: 1;
  }

  /* 木槌 */
  .muyu-mallet {
    position: absolute;
    width: 32px;
    height: 32px;
    top: -10px;
    right: -6px;
    z-index: 2;
    pointer-events: none;
    transform-origin: 70% 80%;
    transform: rotate(0deg);
    transition: transform 0.15s ease-out;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
  }
  .muyu-mallet.tapping {
    animation: malletTap 0.3s ease-in-out;
  }

  @keyframes malletTap {
    0%   { transform: rotate(0deg) translate(0, 0); }
    40%  { transform: rotate(-28deg) translate(-2px, 4px); }
    60%  { transform: rotate(-22deg) translate(-1px, 2px); }
    100% { transform: rotate(0deg) translate(0, 0); }
  }

  /* 木鱼被敲击时的微震动 */
  .muyu-btn-svg.tapping .muyu-svg {
    animation: muyuShake 0.3s ease-in-out;
  }
  @keyframes muyuShake {
    0%   { transform: translate(0, 0); }
    25%  { transform: translate(0, 1px); }
    50%  { transform: translate(0, -1px); }
    75%  { transform: translate(0, 0.5px); }
    100% { transform: translate(0, 0); }
  }

  .muyu-click-count {
    display: none !important;
  }

  /* ========== PETAL ========== */
  /* 花瓣（全局，不能用 scoped） */
</style>

<style>
  /* 全局样式：花瓣 + 涟漪 */
  .petal {
    position: fixed;
    pointer-events: none;
    z-index: 102;
    animation: petalFall linear forwards;
  }
  @keyframes petalFall {
    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
    85%  { opacity: 0.7; }
    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
  }

  .muyu-ripple {
    position: fixed;
    border-radius: 50%;
    border: 2px solid rgba(184, 134, 11, 0.5);
    pointer-events: none;
    z-index: 102;
  }
  @keyframes muyuRipple {
    0%   { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  /* ========== PHILOSOPHY POPUP ========== */
  .phil-overlay {
    position: fixed;
    inset: 0;
    background: rgba(30, 20, 15, 0.65);
    z-index: 5000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(6px);
    padding: 20px;
  }

  .phil-card {
    background: linear-gradient(160deg, var(--card) 0%, var(--card-alt) 100%);
    border-radius: 26px;
    padding: 40px 28px 32px;
    max-width: 380px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(196,122,94,0.1);
    position: relative;
    overflow: hidden;
    animation: philPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes philPop {
    from { transform: scale(0.6) translateY(30px); opacity: 0; }
    60%  { transform: scale(1.03) translateY(-3px); }
    to   { transform: scale(1) translateY(0); opacity: 1; }
  }

  .phil-card::before {
    content: '';
    position: absolute;
    top: -30px;
    right: -30px;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(196,122,94,0.08), transparent 70%);
    pointer-events: none;
  }

  .phil-icon {
    font-size: 42px;
    margin-bottom: 18px;
    animation: philIconIn 0.6s ease 0.2s both;
  }
  @keyframes philIconIn {
    from { transform: scale(0) rotate(-20deg); opacity: 0; }
    70%  { transform: scale(1.2) rotate(5deg); }
    to   { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  .phil-quote {
    font-size: 17px;
    font-weight: 600;
    color: var(--text);
    line-height: 1.8;
    margin-bottom: 16px;
    letter-spacing: 0.3px;
  }

  .phil-source {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 24px;
    font-style: italic;
  }

  .phil-category {
    display: inline-block;
    font-size: 10px;
    color: var(--primary);
    background: var(--accent);
    padding: 3px 12px;
    border-radius: 10px;
    margin-bottom: 20px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .phil-btn {
    padding: 11px 36px;
    background: linear-gradient(145deg, var(--primary-light), var(--primary-dark));
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 4px 14px rgba(196,122,94,0.3);
    transition: transform 0.1s;
    -webkit-tap-highlight-color: transparent;
  }
  .phil-btn:active {
    transform: scale(0.96);
  }

  /* 弹窗过渡 */
  .phil-enter-active,
  .phil-leave-active {
    transition: opacity 0.3s ease;
  }
  .phil-enter-from,
  .phil-leave-to {
    opacity: 0;
  }

  /* ========== RESPONSIVE ========== */
  @media (max-width: 640px) {
    .muyu-by-progress {
      left: max(4px, calc(50% - 100px));
      top: 78px;
    }
    .muyu-btn-svg {
      width: 52px;
      height: 52px;
    }
    .muyu-svg { width: 42px; height: 38px; }
    .muyu-mallet { width: 26px; height: 26px; top: -8px; right: -4px; }
    .phil-card { padding: 32px 20px 28px; border-radius: 22px; }
    .phil-quote { font-size: 15px; }
  }

  @media (max-width: 380px) {
    .muyu-by-progress {
      left: 2px;
      top: auto;
      bottom: 8px;
      transform: none;
    }
    .muyu-btn-svg { width: 44px; height: 44px; }
    .muyu-svg { width: 36px; height: 32px; }
    .muyu-mallet { width: 22px; height: 22px; top: -6px; right: -3px; }
  }
</style>
