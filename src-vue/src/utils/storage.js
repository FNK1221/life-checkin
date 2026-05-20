import Dexie from 'dexie'

// 创建 Dexie 数据库
const db = new Dexie('LifeCheckinDB')

db.version(1).stores({
  checkins: 'id, date',   // id = eventId
  media: 'id, eventId, type'  // type: 'photo' | 'audio' | 'video'
})

// ========== 照片压缩 ==========
export function compressImage(file, maxW = 600, quality = 0.65) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width
      let h = img.height
      if (w > maxW) {
        h = Math.round(h * maxW / w)
        w = maxW
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => resolve(blob),
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = URL.createObjectURL(file)
  })
}

// ========== 打卡数据（localStorage）==========

// 保存打卡数据到 localStorage
export function saveCheckin(eventId, data) {
  const all = JSON.parse(localStorage.getItem('lifeCheckinData') || '{}')
  all[eventId] = data
  localStorage.setItem('lifeCheckinData', JSON.stringify(all))
  return Promise.resolve()
}

// 加载打卡数据
export function loadCheckinData() {
  return Promise.resolve(JSON.parse(localStorage.getItem('lifeCheckinData') || '{}'))
}

// 删除打卡数据
export function deleteCheckin(eventId) {
  const all = JSON.parse(localStorage.getItem('lifeCheckinData') || '{}')
  delete all[eventId]
  localStorage.setItem('lifeCheckinData', JSON.stringify(all))
  return Promise.resolve()
}

// ========== 媒体文件（IndexedDB / Dexie）==========

// 保存媒体文件到 IndexedDB (Dexie)
export async function saveMedia(eventId, type, blob, fileName = '') {
  const arrayBuffer = await blob.arrayBuffer()
  const id = `${eventId}_${type}_${Date.now()}`

  await db.media.put({
    id,
    eventId,
    type,
    name: fileName || `${type}_${Date.now()}`,
    mimeType: blob.type,
    data: arrayBuffer,
    size: blob.size,
    createdAt: new Date()
  })

  return id
}

// 获取媒体文件（返回 { blob, url, name }）
export async function getMediaForEvent(eventId, type) {
  const items = await db.media
    .where('eventId').equals(eventId)
    .and(item => item.type === type)
    .toArray()

  if (items.length === 0) return null

  const item = items[items.length - 1]  // 最新的一条
  const blob = new Blob([item.data], { type: item.mimeType })
  return {
    blob,
    url: URL.createObjectURL(blob),
    name: item.name
  }
}

// 删除媒体文件
export async function deleteMediaForEvent(eventId) {
  await db.media.where('eventId').equals(eventId).delete()
}

// ========== 自定义事件 ==========

export function loadCustomEvents() {
  return JSON.parse(localStorage.getItem('lifeCustomEvents') || '[]')
}

export function saveCustomEvents(list) {
  localStorage.setItem('lifeCustomEvents', JSON.stringify(list))
}

// ========== 存储使用情况 ==========

export async function getStorageUsage() {
  const estimate = await navigator.storage.estimate()
  return {
    used: estimate.usageDetails?.indexedDB || 0,
    quota: estimate.quota || 0,
    percent: Math.round((estimate.usageDetails?.indexedDB || 0) / (estimate.quota || 1) * 100)
  }
}

export default db
