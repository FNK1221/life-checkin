// shareCard.js - 分享卡片 Canvas 绘制工具
// 从原 index.html 迁移

// ========== 分享卡片主题 ==========
export const SHARE_CARD_THEMES = [
  { name:'暖阳陶土', bg:['#c47a5e','#b86248','#a05038','#8a4030'], glow:[255,200,140] },
  { name:'深海蔚蓝', bg:['#2a6a8f','#1f5a7a','#154a65','#0d3a50'], glow:[100,200,255] },
  { name:'森林墨绿', bg:['#2d6a4f','#1f5a3f','#144a30','#0a3a22'], glow:[100,255,180] },
  { name:'星夜紫', bg:['#4a2d7a','#3a1f6a','#2a1055','#1a0845'], glow:[180,140,255] },
  { name:'日落玫瑰', bg:['#a83e6e','#8f2d5a','#751d48','#5a1035'], glow:[255,140,200] },
  { name:'金黄麦田', bg:['#b8860b','#a07010','#885a0a','#704505'], glow:[255,220,100] },
  { name:'午夜灰蓝', bg:['#36454f','#2a3840','#1e2d35','#121e28'], glow:[150,200,230] },
  { name:'珊瑚橘', bg:['#e07050','#c86040','#a85030','#883820'], glow:[255,180,140] }
]

// ========== 个性标签 ==========
export function calculatePersonalityTag(checkinData, CHAPTERS, TOTAL) {
  // 统计每个章节的完成数
  const chapterCount = []
  CHAPTERS.forEach((ch, ci) => {
    let count = 0
    ch.events.forEach((_, ei) => {
      if (checkinData[ci + '-' + ei]) count++
    })
    chapterCount.push({ index: ci, count, title: ch.title, icon: ch.icon })
  })

  // 按完成数排序
  chapterCount.sort((a, b) => b.count - a.count)

  // 根据最多的章节生成标签
  const top = chapterCount[0]
  if (top.count === 0) return '🌱 人生新芽'

  const tags = {
    0: ['🌱 童年回忆家', '📸 纯真岁月'],
    1: ['📚 求学追梦人', '🎓 知识探索者'],
    2: ['💼 职场奋斗者', '🚀 事业打拼家'],
    3: ['❤️ 温暖家人', '💑 感情丰富家'],
    4: ['🏠 生活家', '🍳 居家能手'],
    5: ['🌍 冒险家', '✈️ 世界探索者'],
    6: ['🎉 仪式感达人', '📷 回忆收藏家'],
    7: ['🕰️ 人生智者', '🌟 岁月沉淀家']
  }

  const options = tags[top.index] || ['🌟 人生体验家']
  return options[Math.floor(Math.random() * options.length)]
}

// ========== 辅助函数：圆角矩形路径 ==========
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ========== 1. 背景：渐变 + 光晕 + 网格 + 装饰形状 ==========
function _shareBG(ctx, W, H, theme) {
  // 主渐变
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, theme.bg[0])
  bg.addColorStop(0.35, theme.bg[1])
  bg.addColorStop(0.7, theme.bg[2])
  bg.addColorStop(1, theme.bg[3])
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 顶部光晕
  const ga = theme.glow
  const tg = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, 500)
  tg.addColorStop(0, 'rgba(' + ga[0] + ',' + ga[1] + ',' + ga[2] + ',0.25)')
  tg.addColorStop(1, 'rgba(' + ga[0] + ',' + ga[1] + ',' + ga[2] + ',0)')
  ctx.fillStyle = tg
  ctx.fillRect(0, 0, W, 400)

  // 底部光晕
  const bglow = ctx.createRadialGradient(W * 0.5, H, 0, W * 0.5, H, 400)
  bglow.addColorStop(0, 'rgba(' + ga[0] + ',' + ga[1] + ',' + ga[2] + ',0.15)')
  bglow.addColorStop(1, 'rgba(' + ga[0] + ',' + ga[1] + ',' + ga[2] + ',0)')
  ctx.fillStyle = bglow
  ctx.fillRect(0, H - 400, W, 400)

  // 网格纹理（极低存在感）
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1
  for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }
  for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke() }
  ctx.restore()

  // 浮动装饰
  _shareDeco(ctx, W, H)
}

// ========== 1.1 浮动装饰形状（圆 + 点 + 十字）==========
function _shareDeco(ctx, W, H) {
  ctx.save()
  // 大圆
  [
    { x: 60, y: 180, r: 40, a: 0.08 },
    { x: W - 50, y: 220, r: 55, a: 0.06 },
    { x: 90, y: H - 200, r: 70, a: 0.05 },
    { x: W - 80, y: H - 160, r: 50, a: 0.07 },
    { x: 150, y: 500, r: 30, a: 0.1 },
    { x: W - 120, y: 450, r: 35, a: 0.08 }
  ].forEach(s => {
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')'
    ctx.fill()
  })

  // 小圆点
  [
    { x: 120, y: 100, r: 4 },
    { x: W - 100, y: 140, r: 3 },
    { x: 80, y: 400, r: 5 },
    { x: W - 60, y: 380, r: 4 },
    { x: 200, y: 700, r: 3 },
    { x: W - 150, y: 750, r: 4 },
    { x: 130, y: 950, r: 3 },
    { x: W - 110, y: 920, r: 5 }
  ].forEach(d => {
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fill()
  })

  // 十字
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5
  [
    { x: 45, y: 300, len: 12 },
    { x: W - 45, y: 340, len: 10 },
    { x: 100, y: 600, len: 8 },
    { x: W - 70, y: 580, len: 10 },
    { x: 70, y: 820, len: 12 },
    { x: W - 90, y: 850, len: 8 }
  ].forEach(c => {
    ctx.beginPath(); ctx.moveTo(c.x - c.len, c.y); ctx.lineTo(c.x + c.len, c.y)
    ctx.moveTo(c.x, c.y - c.len); ctx.lineTo(c.x, c.y + c.len); ctx.stroke()
  })

  ctx.restore()
}

// ========== 2. 标题区 ==========
function _shareTitle(ctx, W) {
  ctx.textAlign = 'center'
  ctx.font = '500 18px -apple-system, PingFang SC, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('L I F E  E X P E R I E N C E S', W / 2, 70)

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 4
  ctx.font = 'bold 48px -apple-system, PingFang SC, sans-serif'
  ctx.fillStyle = '#fff'
  ctx.fillText('人生体验卡', W / 2, 125)
  ctx.restore()

  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(W / 2 - 80, 145); ctx.lineTo(W / 2 + 80, 145); ctx.stroke()
}

// ========== 3. 中央进度圆环 ==========
function _shareCircle(ctx, W, pct, done, TOTAL) {
  const cx = W / 2, cy = 310, cr = 100

  // 外圈虚线
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6])
  ctx.beginPath(); ctx.arc(cx, cy, cr + 18, 0, Math.PI * 2); ctx.stroke(); ctx.restore()

  // 背景圆环
  ctx.beginPath()
  ctx.arc(cx, cy, cr, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 10; ctx.stroke()

  // 进度圆弧（带发光）
  ctx.beginPath()
  ctx.arc(cx, cy, cr, -Math.PI / 2, -Math.PI / 2 + (pct / 100) * Math.PI * 2)
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.lineCap = 'round'
  ctx.shadowColor = 'rgba(255,255,255,0.4)'; ctx.shadowBlur = 12
  ctx.stroke()
  ctx.shadowBlur = 0

  // 中心数字
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 56px -apple-system, sans-serif'
  ctx.fillText(pct + '%', cx, cy + 10)
  ctx.font = '22px -apple-system, PingFang SC, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText(done + ' / ' + TOTAL, cx, cy + 42)
}

// ========== 4. 个性标签 ==========
function _shareTag(ctx, W, tag) {
  const tagY = 460
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  roundRectPath(ctx, W / 2 - 130, tagY - 32, 260, 44, 22)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1
  roundRectPath(ctx, W / 2 - 130, tagY - 32, 260, 44, 22)
  ctx.stroke()
  ctx.restore()

  ctx.font = '500 20px -apple-system, PingFang SC, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.textAlign = 'center'
  ctx.fillText(tag, W / 2, tagY)
}

// ========== 5. 章节进度条（返回统计区起始 Y）==========
function _shareBars(ctx, W, chapterStats) {
  let chartY = 540
  ctx.font = '500 20px -apple-system, PingFang SC, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.textAlign = 'left'
  ctx.fillText('章节进度', 55, chartY)

  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(55, chartY + 12); ctx.lineTo(W - 55, chartY + 12); ctx.stroke()

  const barStartY = chartY + 35, barH = 10, barMaxW = W - 190, rowH = 52
  chapterStats.forEach((s, i) => {
    const y = barStartY + i * rowH
    ctx.font = '18px -apple-system, PingFang SC, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.textAlign = 'left'
    ctx.fillText(s.icon + ' ' + s.title, 55, y)

    ctx.font = '16px -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.textAlign = 'right'
    ctx.fillText(s.count + '/' + s.total, W - 55, y)

    // 背景条
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    roundRectPath(ctx, 55, y + 8, barMaxW, barH, 5)
    ctx.fill()

    // 填充条
    if (s.count > 0) {
      const bw = (s.count / s.total) * barMaxW
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      roundRectPath(ctx, 55, y + 8, bw, barH, 5)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      roundRectPath(ctx, 55, y + 8, Math.min(bw, 30), barH, 5)
      ctx.fill()
    }
  })

  return barStartY + chapterStats.length * rowH + 60
}

// ========== 6. 统计数字区 ==========
function _shareStats(ctx, W, midY, photosCount, recentDate, completedChapters) {
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(55, midY - 20); ctx.lineTo(W - 55, midY - 20); ctx.stroke()

  const stats = [
    { label: '照片记录', value: '' + photosCount },
    { label: '最近打卡', value: recentDate },
    { label: '完成章节', value: '' + completedChapters }
  ]

  const statW = (W - 110) / 3
  stats.forEach((st, i) => {
    const sx = 55 + i * statW + statW / 2
    ctx.textAlign = 'center'
    ctx.font = 'bold 28px -apple-system, sans-serif'
    ctx.fillStyle = '#fff'
    ctx.fillText(st.value, sx, midY + 18)
    ctx.font = '16px -apple-system, PingFang SC, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText(st.label, sx, midY + 44)
  })
}

// ========== 7. 底部 ==========
function _shareFooter(ctx, W, H) {
  const botY = H - 90
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(W / 2 - 100, botY); ctx.lineTo(W / 2 + 100, botY); ctx.stroke()

  ctx.textAlign = 'center'
  ctx.font = '20px -apple-system, PingFang SC, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText('记录人生体验，珍惜每一个瞬间', W / 2, botY + 28)

  ctx.font = '16px -apple-system, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  const today = new Date()
  const dateStr = today.getFullYear() + '.' + (today.getMonth() + 1) + '.' + today.getDate()
  ctx.fillText('Generated on ' + dateStr + '  ·  人生体验卡', W / 2, botY + 52)
}

// ========== 主入口：生成分享卡片 ==========
export function generateShareCard(checkinData, CHAPTERS, TOTAL, customEvents = []) {
  const done = Object.keys(checkinData).filter(k => checkinData[k] && checkinData[k].date).length
  const pct = TOTAL > 0 ? Math.round(done / TOTAL * 100) : 0
  const tag = calculatePersonalityTag(checkinData, CHAPTERS, TOTAL)
  const theme = SHARE_CARD_THEMES[Math.floor(Math.random() * SHARE_CARD_THEMES.length)]

  // 构建章节统计
  const chapterStats = CHAPTERS.map((ch, ci) => {
    let count = 0
    ch.events.forEach((_, ei) => { if (checkinData[ci + '-' + ei]) count++ })
    return { title: ch.title, icon: ch.icon, count, total: ch.events.length }
  })

  // 创建 canvas
  const canvas = document.createElement('canvas')
  const W = 750, H = 1200
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // 按顺序绘制各区域
  _shareBG(ctx, W, H, theme)
  _shareTitle(ctx, W)
  _shareCircle(ctx, W, pct, done, TOTAL)
  _shareTag(ctx, W, tag)
  const midY = _shareBars(ctx, W, chapterStats)
  // 统计照片数量
  let photosCount = 0
  Object.keys(checkinData).forEach(k => { if (checkinData[k] && checkinData[k].photo) photosCount++ })
  // 获取最近打卡日期
  let recentDate = ''
  Object.keys(checkinData).forEach(k => {
    const d = checkinData[k] && checkinData[k].date
    if (d && (!recentDate || d > recentDate)) recentDate = d
  })
  recentDate = recentDate ? recentDate.replace(/-/g, '.') : '-'
  // 统计完成章节数
  let completedChapters = 0
  CHAPTERS.forEach((ch, ci) => {
    const allDone = ch.events.every((_, ei) => !!checkinData[ci + '-' + ei])
    if (allDone) completedChapters++
  })
  _shareStats(ctx, W, midY, photosCount, recentDate, completedChapters)
  _shareFooter(ctx, W, H)

  // 返回 data URL
  return canvas.toDataURL('image/png')
}
