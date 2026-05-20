<template>
  <div id="loadingScreen" ref="screenRef">
    <canvas ref="canvasRef" id="loadingCanvas"></canvas>
    <div id="loadingText" :class="{ show: textVisible }">{{ loadingText }}</div>
    <div id="loadingHint">正在孕育生命…</div>
    <button id="skipLoadingBtn" @click="skipLoading">跳过动画 ▸</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['loading-complete'])

const screenRef = ref(null)
const canvasRef = ref(null)
const textVisible = ref(false)
const loadingText = ref('')

// Canvas 上下文
let ctx = null
let canvas = null
let animationId = null
let safetyTimer = null

// 响应式尺寸
let W = () => canvas?.width || window.innerWidth
let H = () => canvas?.height || window.innerHeight
let cx = () => W() / 2
let cy = () => H() / 2

// 音频
let loadingAudio = null
let audioUnlocked = false
let audioPlayAttempted = false

// 动画状态
let frame = 0
let animDone = false
let loadingFinished = false

// 星场
let stars = []
// 粒子
let particles = []
const MAX_PARTICLES = 300

// ========== 生命周期 ==========
onMounted(() => {
  canvas = canvasRef.value
  if (!canvas) { finishLoading(); return }
  ctx = canvas.getContext('2d')

  resize()
  window.addEventListener('resize', resize)

  initStars()
  initLoadingAudio()

  // 安全兜底：15 秒强制结束
  safetyTimer = setTimeout(() => finishLoading(), 15000)

  // 延迟显示文字
  setTimeout(() => { textVisible.value = true }, 1200)

  // 启动动画循环
  requestAnimationFrame(loop)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (animationId) cancelAnimationFrame(animationId)
  if (safetyTimer) clearTimeout(safetyTimer)
})

function resize() {
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

// ========== 星场 ==========
function initStars() {
  stars = []
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      r: 0.3 + Math.random() * 1.2,
      a: 0.15 + Math.random() * 0.35,
      twinkleSpeed: 0.005 + Math.random() * 0.02,
      twinkleOffset: Math.random() * Math.PI * 2
    })
  }
}

function drawStars(f) {
  for (const s of stars) {
    const twinkle = Math.sin(f * s.twinkleSpeed + s.twinkleOffset) * 0.3 + 0.7
    ctx.globalAlpha = s.a * twinkle
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(s.x % W(), s.y % H(), s.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

// ========== 粒子系统 ==========
function spawnP(x, y, count, colorFn, speed, life) {
  if (particles.length + count > MAX_PARTICLES) {
    particles.splice(0, particles.length + count - MAX_PARTICLES)
  }
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const s = speed * (0.3 + Math.random() * 0.7)
    const c = colorFn ? colorFn() : 'rgba(255,220,140,0.8)'
    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: life || 60,
      maxLife: life || 60,
      r: 1 + Math.random() * 2.5,
      color: c
    })
  }
}

function tickP() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx; p.y += p.vy; p.life--
    if (p.life <= 0) particles.splice(i, 1)
  }
}

function drawP() {
  for (const p of particles) {
    const a = p.life / p.maxLife
    ctx.globalAlpha = a * 0.8
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

// ========== 背景音乐 ==========
function initLoadingAudio() {
  loadingAudio = document.getElementById('loadingAudio')
  if (!loadingAudio) { console.warn('[audio] 找不到 audio 元素'); return }

  // 技巧1: play 事件
  const onPlay = () => {
    if (audioUnlocked) return
    loadingAudio.muted = false
    loadingAudio.volume = 1.0
    loadingAudio.play().then(() => {
      audioUnlocked = true
      console.log('[audio] ✅ 音乐已成功播放（无交互）')
    }).catch(() => {})
    loadingAudio.removeEventListener('play', onPlay)
  }
  loadingAudio.addEventListener('play', onPlay)

  // 技巧2: canplay 事件
  const onCanPlay = () => {
    if (audioUnlocked) return
    loadingAudio.muted = false
    loadingAudio.volume = 1.0
    loadingAudio.play().then(() => {
      audioUnlocked = true
      console.log('[audio] ✅ 音乐已通过 canplay 事件播放')
    }).catch(() => {})
    loadingAudio.removeEventListener('canplay', onCanPlay)
  }
  loadingAudio.addEventListener('canplay', onCanPlay)

  // 技巧3: 延迟播放
  setTimeout(() => {
    if (audioUnlocked) return
    loadingAudio.muted = false
    loadingAudio.volume = 1.0
    loadingAudio.play().then(() => {
      audioUnlocked = true
      console.log('[audio] ✅ 音乐已通过延迟播放成功')
    }).catch(() => {
      if (!audioUnlocked) unlockAudioOnInteraction()
    })
  }, 100)

  console.log('[audio] 音频已初始化，尝试自动播放...')
}

function unlockAudioOnInteraction() {
  const events = ['touchstart', 'mousedown', 'click', 'keydown', 'pointerdown']
  const handler = () => {
    if (audioUnlocked) return
    audioUnlocked = true
    loadingAudio.muted = false
    loadingAudio.volume = 1.0
    loadingAudio.play().catch(() => {})
    events.forEach(evt => document.removeEventListener(evt, handler))
  }
  events.forEach(evt => document.addEventListener(evt, handler, { once: true, passive: true }))
}

function tryPlayLoadingMusic() {
  if (!loadingAudio || audioUnlocked || audioPlayAttempted) return
  audioPlayAttempted = true
  loadingAudio.muted = false
  loadingAudio.volume = 1.0
  loadingAudio.play().then(() => {
    audioUnlocked = true
    console.log('[audio] ✅ 音乐已成功播放')
  }).catch(() => {
    if (!audioUnlocked) unlockAudioOnInteraction()
  })
}

function stopLoadingMusic() {
  if (!loadingAudio || loadingFinished) return
  loadingAudio.pause()
  loadingAudio.currentTime = 0
  loadingAudio.volume = 1.0
  console.log('[audio] 音乐已立即停止')
}

// ========== 动画阶段 ==========
function drawPhase1(f) {
  const t = f / 120
  const ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2
  const maxDist = W() * 0.38
  const xLeft = cx() - maxDist * (1 - ease)
  const xRight = cx() + maxDist * (1 - ease)
  const orbY = cy() + Math.sin(f * 0.04) * 4

  if (f % 2 === 0) {
    spawnP(xLeft, orbY, 1, () => `rgba(220,230,255,${0.3+Math.random()*0.3})`, 0.3, 35)
    spawnP(xRight, orbY, 1, () => `rgba(255,230,160,${0.3+Math.random()*0.3})`, 0.3, 35)
  }

  // 左光球
  let oL_o = ctx.createRadialGradient(xLeft, orbY, 0, xLeft, orbY, 50 + t * 20)
  oL_o.addColorStop(0, 'rgba(230,240,255,0.12)')
  oL_o.addColorStop(1, 'rgba(230,240,255,0)')
  ctx.fillStyle = oL_o; ctx.beginPath(); ctx.arc(xLeft, orbY, 50 + t * 20, 0, Math.PI*2); ctx.fill()

  let oL_c = ctx.createRadialGradient(xLeft-4, orbY-4, 0, xLeft, orbY, 18)
  oL_c.addColorStop(0, 'rgba(255,255,255,0.95)')
  oL_c.addColorStop(0.6, 'rgba(210,225,255,0.8)')
  oL_c.addColorStop(1, 'rgba(180,200,240,0.4)')
  ctx.fillStyle = oL_c; ctx.beginPath(); ctx.arc(xLeft, orbY, 18, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(xLeft, orbY, 7, 0, Math.PI*2); ctx.fill()

  // 右光球
  let oR_o = ctx.createRadialGradient(xRight, orbY, 0, xRight, orbY, 50 + t * 20)
  oR_o.addColorStop(0, 'rgba(255,230,150,0.13)')
  oR_o.addColorStop(1, 'rgba(255,230,150,0)')
  ctx.fillStyle = oR_o; ctx.beginPath(); ctx.arc(xRight, orbY, 50 + t * 20, 0, Math.PI*2); ctx.fill()

  let oR_c = ctx.createRadialGradient(xRight+4, orbY-4, 0, xRight, orbY, 18)
  oR_c.addColorStop(0, 'rgba(255,255,230,0.95)')
  oR_c.addColorStop(0.6, 'rgba(255,220,130,0.8)')
  oR_c.addColorStop(1, 'rgba(255,200,100,0.4)')
  ctx.fillStyle = oR_c; ctx.beginPath(); ctx.arc(xRight, orbY, 18, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = 'rgba(255,255,200,0.85)'; ctx.beginPath(); ctx.arc(xRight, orbY, 7, 0, Math.PI*2); ctx.fill()
}

function drawPhase2(f) {
  const t = (f - 120) / 80
  const ease = 1 - Math.pow(1 - t, 3)
  const flash = Math.sin(t * Math.PI)

  // 闪光
  ctx.save()
  ctx.globalAlpha = flash * 0.35
  ctx.fillStyle = '#fffbe6'
  ctx.beginPath(); ctx.arc(cx(), cy(), W() * 0.7 * flash, 0, Math.PI*2); ctx.fill()
  ctx.restore()

  // 扩散环
  if (t < 0.6) {
    const ringR = (t / 0.6) * Math.max(W(), H()) * 0.45
    ctx.save()
    ctx.globalAlpha = (1 - t/0.6) * 0.4
    ctx.strokeStyle = 'rgba(255,220,140,0.8)'; ctx.lineWidth = 3*(1-t/0.6)+1
    ctx.beginPath(); ctx.arc(cx(), cy(), ringR, 0, Math.PI*2); ctx.stroke()
    ctx.strokeStyle = 'rgba(255,240,200,0.5)'; ctx.lineWidth = 6*(1-t/0.6)+1
    ctx.beginPath(); ctx.arc(cx(), cy(), ringR*1.05, 0, Math.PI*2); ctx.stroke()
    ctx.restore()
  }

  // 核心光球
  const coreR = 8 + ease * 45
  let coreGlow = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), coreR * 2.5)
  coreGlow.addColorStop(0, `rgba(255,220,100,${0.3+flash*0.2})`)
  coreGlow.addColorStop(0.4, 'rgba(255,180,60,0.1)')
  coreGlow.addColorStop(1, 'rgba(255,180,60,0)')
  ctx.fillStyle = coreGlow; ctx.beginPath(); ctx.arc(cx(), cy(), coreR*2.5, 0, Math.PI*2); ctx.fill()

  let coreGrad = ctx.createRadialGradient(cx()-coreR*0.2, cy()-coreR*0.2, 0, cx(), cy(), coreR)
  coreGrad.addColorStop(0, 'rgba(255,250,230,0.98)')
  coreGrad.addColorStop(0.4, 'rgba(255,210,90,0.95)')
  coreGrad.addColorStop(0.75, 'rgba(220,160,50,0.92)')
  coreGrad.addColorStop(1, 'rgba(180,120,30,0.88)')
  ctx.fillStyle = coreGrad; ctx.beginPath(); ctx.arc(cx(), cy(), coreR, 0, Math.PI*2); ctx.fill()

  // 花瓣轮廓
  ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = 'rgba(255,255,200,0.7)'; ctx.lineWidth = 1.2
  for (let s = 0; s < 3; s++) {
    const soff = s * 2.1 + f * 0.03
    ctx.beginPath()
    for (let a = 0; a <= Math.PI*2; a += 0.08) {
      const rr = coreR * (0.3 + 0.55*Math.sin(a*2+soff))
      const px = cx() + Math.cos(a)*rr, py = cy() + Math.sin(a)*rr
      if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
    }
    ctx.closePath(); ctx.stroke()
  }
  ctx.restore()

  if (f % 2 === 0 && t < 0.7) {
    spawnP(cx(), cy(), 3, () => `hsl(${35+Math.random()*25}, ${80+Math.random()*20}%, ${65+Math.random()*20}%)`, 1.5+Math.random()*2, 40+Math.random()*20)
  }
}

function drawPhase3(f) {
  const t = (f - 200) / 140
  const pulse = Math.sin(f * 0.04) * 0.5 + 0.5
  const rotateAngle = f * 0.008
  const coreR = 50 + pulse * 5

  // 外圈光晕
  for (let L = 0; L < 3; L++) {
    const Lr = coreR * (1.3 + L*0.45 + Math.sin(f*0.03+L)*0.1)
    let Lg = ctx.createRadialGradient(cx(), cy(), coreR*0.8, cx(), cy(), Lr)
    Lg.addColorStop(0, `rgba(255,200,80,${0.08 - L*0.02})`)
    Lg.addColorStop(1, 'rgba(255,180,60,0)')
    ctx.fillStyle = Lg; ctx.beginPath(); ctx.arc(cx(), cy(), Lr, 0, Math.PI*2); ctx.fill()
  }

  ctx.save()
  ctx.translate(cx(), cy())
  ctx.rotate(rotateAngle)

  // 核心
  let g2 = ctx.createRadialGradient(-coreR*0.15, -coreR*0.15, 0, 0, 0, coreR)
  g2.addColorStop(0, 'rgba(255,252,230,0.98)')
  g2.addColorStop(0.4, 'rgba(255,210,90,0.95)')
  g2.addColorStop(0.75, 'rgba(220,160,50,0.92)')
  g2.addColorStop(1, 'rgba(180,120,30,0.88)')
  ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI*2); ctx.fill()

  // 纹理线
  ctx.globalAlpha = 0.18; ctx.strokeStyle = 'rgba(255,255,200,0.7)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(0, 0, coreR*0.35, -Math.PI/2, Math.PI*1.5); ctx.stroke()
  ctx.beginPath(); ctx.arc(-coreR*0.12, 0, coreR*0.22, 0, Math.PI*2); ctx.stroke()
  ctx.beginPath(); ctx.arc( coreR*0.12, 0, coreR*0.22, 0, Math.PI*2); ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,200,0.5)'
  ctx.beginPath(); ctx.arc(-coreR*0.12, 0, coreR*0.06, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc( coreR*0.12, 0, coreR*0.06, 0, Math.PI*2); ctx.fill()

  // 裂纹光芒
  if (t > 0.35) {
    const crackAlpha = Math.min(1, (t-0.35)/0.2)
    ctx.globalAlpha = crackAlpha * 0.6; ctx.strokeStyle = 'rgba(255,100,30,0.8)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'
    for (let c = 0; c < 6; c++) {
      const ca = c*(Math.PI/3) + f*0.01
      const innerR = coreR * (0.2 + Math.sin(f*0.05+c)*0.1)
      const outerR = coreR * (0.75 + Math.sin(f*0.03+c)*0.15)
      ctx.beginPath()
      ctx.moveTo(Math.cos(ca)*innerR, Math.sin(ca)*innerR)
      ctx.quadraticCurveTo(Math.cos(ca+0.2)*outerR*0.7, Math.sin(ca+0.2)*outerR*0.7, Math.cos(ca)*outerR, Math.sin(ca)*outerR)
      ctx.stroke()
    }
    ctx.globalAlpha = crackAlpha * 0.35
    ctx.fillStyle = 'rgba(255,180,50,0.7)'
    ctx.beginPath(); ctx.arc(0, 0, coreR*1.05, 0, Math.PI*2); ctx.fill()
  }

  ctx.restore()

  // 外部粒子
  if (f % 4 === 0) {
    const fa = Math.random()*Math.PI*2
    const fd = coreR*1.2 + Math.random()*40
    spawnP(cx()+Math.cos(fa)*fd, cy()+Math.sin(fa)*fd, 1,
      () => `rgba(255,220,140,${0.3+Math.random()*0.3})`, 0.2, 50)
  }

  if (t > 0.6) {
    const intensity = (t-0.6)/0.4 * pulse
    ctx.save()
    ctx.globalAlpha = intensity * 0.18
    ctx.fillStyle = '#fffbe6'
    ctx.beginPath(); ctx.arc(cx(), cy(), coreR*(1.5+intensity*0.8), 0, Math.PI*2); ctx.fill()
    ctx.restore()
  }
}

function drawPhase4(f) {
  const t = (f - 340) / 75
  const ease = 1 - Math.pow(1 - Math.min(t,1), 3)

  if (t < 0.4) {
    const st = t / 0.4
    const stEase = 1 - Math.pow(1-st, 2)

    // 爆裂环
    const burstR = stEase * Math.max(W(),H())*0.5
    ctx.save()
    ctx.globalAlpha = (1-stEase)*0.3; ctx.strokeStyle = 'rgba(255,220,120,0.9)'; ctx.lineWidth = 4*(1-stEase)+1
    ctx.beginPath(); ctx.arc(cx(), cy(), burstR, 0, Math.PI*2); ctx.stroke()
    ctx.restore()

    // 碎片粒子
    if (f % 2 === 0) {
      for (let i = 0; i < 5; i++) {
        const a = Math.random()*Math.PI*2
        const d = 20 + Math.random()*30
        spawnP(cx()+Math.cos(a)*d, cy()+Math.sin(a)*d, 1,
          () => `rgba(${200+Math.random()*20},${140+Math.random()*40},${30+Math.random()*20},0.6)`, 1.5+Math.random()*2, 25+Math.random()*15)
      }
    }

    // 残留光球
    const remR = 50 * (1 - stEase*0.7)
    ctx.save(); ctx.globalAlpha = 1 - stEase*0.6
    let remGrad = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), remR)
    remGrad.addColorStop(0, 'rgba(255,240,200,0.9)')
    remGrad.addColorStop(1, 'rgba(220,160,50,0.7)')
    ctx.fillStyle = remGrad
    for (let f2 = 0; f2 < 6; f2++) {
      const fa2 = f2*(Math.PI/3) + stEase*2
      const fr = remR * (0.4 + 0.6*(1-stEase*0.5))
      ctx.beginPath()
      ctx.arc(cx()+Math.cos(fa2)*remR*0.2*stEase, cy()+Math.sin(fa2)*remR*0.2*stEase, fr*0.55, fa2, fa2+Math.PI/3)
      ctx.arc(cx(), cy(), remR*0.3, fa2+Math.PI/3, fa2, true)
      ctx.fill()
    }
    ctx.restore()
  }
  // t >= 0.4: 不绘制新内容，让粒子自然消散
}

// Phase 5: 无额外绘制，粒子自然消散
// function drawPhase5(f) {}  // 空函数，tickP/drawP 继续处理粒子

// ========== 动画主循环 ==========
function loop() {
  tryPlayLoadingMusic()

  if (animDone) { finishLoading(); return }

  ctx.clearRect(0, 0, W(), H())
  drawStars(frame)

  if (frame < 120) {
    drawPhase1(frame)
  } else if (frame < 200) {
    drawPhase2(frame)
  } else if (frame < 340) {
    drawPhase3(frame)
  } else if (frame < 415) {
    drawPhase4(frame)
  } else if (frame < 421) {
    // Phase 5: 粒子自然消散，无额外绘制
  } else {
    // 动画完成
    stopLoadingMusic()
    finishLoading()
    return
  }

  tickP()
  drawP()
  frame++
  animationId = requestAnimationFrame(loop)
}

// ========== 结束加载 ==========
function finishLoading() {
  if (loadingFinished) return
  loadingFinished = true
  if (safetyTimer) clearTimeout(safetyTimer)
  const btn = document.getElementById('skipLoadingBtn')
  if (btn) btn.style.display = 'none'
  stopLoadingMusic()
  const screen = screenRef.value
  if (screen) {
    screen.classList.add('fade-out')
    setTimeout(() => { screen.style.display = 'none' }, 800)
  }
  animDone = true
  emit('loading-complete')
}

function skipLoading() {
  if (animDone) return
  const btn = document.getElementById('skipLoadingBtn')
  if (btn) btn.style.display = 'none'
  // 立即完成，不等粒子
  finishLoading()
}

defineExpose({ skipLoading, finishLoading })
</script>

<style scoped>
#loadingScreen {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #1a0e0a;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.8s ease;
}
#loadingScreen.fade-out { opacity: 0; pointer-events: none; }
#loadingCanvas { display: block; }
#loadingText {
  position: absolute;
  bottom: 18%;
  left: 50%;
  transform: translateX(-50%);
  color: #fce8d8;
  font-size: 16px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.5s;
  text-align: center;
  white-space: nowrap;
  text-shadow: 0 0 12px rgba(255,200,150,0.5);
  letter-spacing: 2px;
}
#loadingText.show { opacity: 1; }
#loadingHint {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(252,232,216,0.4);
  font-size: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}
#skipLoadingBtn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.25);
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s, color 0.2s;
  font-family: inherit;
}
#skipLoadingBtn:hover { background: rgba(255,255,255,0.22); color: rgba(255,255,255,0.9); }
#skipLoadingBtn:active { background: rgba(255,255,255,0.30); }
@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
</style>
