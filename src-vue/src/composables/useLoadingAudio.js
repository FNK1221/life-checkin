import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 载入音乐 composable
 * 处理背景音乐的自动播放（3 种技巧）+ 用户交互解锁
 */
export function useLoadingAudio() {
  const audioUnlocked = ref(false)
  const audioPlayAttempted = ref(false)
  let loadingAudio = null

  // 尝试播放音乐
  function tryPlayLoadingMusic() {
    if (!loadingAudio || audioUnlocked.value || audioPlayAttempted.value) return
    audioPlayAttempted.value = true

    console.log('[audio] 尝试播放载入音乐...')
    loadingAudio.muted = false
    loadingAudio.volume = 1.0

    const playPromise = loadingAudio.play()
    if (playPromise !== undefined) {
      playPromise.then(() => {
        audioUnlocked.value = true
        console.log('[audio] ✅ 音乐已成功播放')
      }).catch((e) => {
        console.log('[audio] 播放失败（可能需要交互）:', e.message)
        if (!audioUnlocked.value) {
          unlockAudioOnInteraction()
        }
      })
    }
  }

  // 监听 play 事件（即使静音也会触发）
  function onPlay() {
    if (audioUnlocked.value) return
    console.log('[audio] play 事件触发，尝试取消静音...')
    loadingAudio.muted = false
    loadingAudio.volume = 1.0
    loadingAudio.play().then(() => {
      audioUnlocked.value = true
      console.log('[audio] ✅ 音乐已成功播放（无交互）')
    }).catch((e) => {
      console.log('[audio] 取消静音后播放失败:', e.message)
    })
    loadingAudio.removeEventListener('play', onPlay)
  }

  // 监听 canplay 事件
  function onCanPlay() {
    if (audioUnlocked.value) return
    console.log('[audio] canplay 事件触发，尝试播放...')
    loadingAudio.muted = false
    loadingAudio.volume = 1.0
    loadingAudio.play().then(() => {
      audioUnlocked.value = true
      console.log('[audio] ✅ 音乐已通过 canplay 事件播放')
    }).catch((e) => {
      console.log('[audio] canplay 事件播放失败:', e.message)
    })
    loadingAudio.removeEventListener('canplay', onCanPlay)
  }

  // 延迟 100ms 播放
  function delayedPlay() {
    if (audioUnlocked.value) return
    console.log('[audio] 尝试技巧3: 延迟播放...')
    loadingAudio.muted = false
    loadingAudio.volume = 1.0
    loadingAudio.play().then(() => {
      audioUnlocked.value = true
      console.log('[audio] ✅ 音乐已通过延迟播放成功')
    }).catch((e) => {
      console.log('[audio] 延迟播放失败:', e.message)
      if (!audioUnlocked.value) {
        unlockAudioOnInteraction()
      }
    })
  }

  // 等待用户交互后解锁音频
  function unlockAudioOnInteraction() {
    const events = ['touchstart', 'mousedown', 'click', 'keydown', 'pointerdown']
    const handler = () => {
      if (audioUnlocked.value) return
      audioUnlocked.value = true
      loadingAudio.muted = false
      loadingAudio.volume = 1.0
      loadingAudio.play().then(() => {
        console.log('[audio] 音乐已通过用户交互开始播放')
      }).catch((e) => {
        console.warn('[audio] 用户交互后播放失败:', e)
      })
      events.forEach((evt) => {
        document.removeEventListener(evt, handler)
      })
    }
    events.forEach((evt) => {
      document.addEventListener(evt, handler, { once: true, passive: true })
    })
  }

  // 立即停止音乐
  function stopLoadingMusic() {
    if (!loadingAudio || audioUnlocked.value === undefined) return
    loadingAudio.pause()
    loadingAudio.currentTime = 0
    loadingAudio.volume = 1.0  // 重置音量，以便下次播放
    console.log('[audio] 音乐已立即停止')
  }

  // 初始化
  function initLoadingAudio() {
    if (loadingAudio) return
    loadingAudio = document.getElementById('loadingAudio')
    if (!loadingAudio) {
      console.warn('[audio] 找不到 audio 元素')
      return
    }

    // 技巧1: 监听 play 事件
    loadingAudio.addEventListener('play', onPlay)

    // 技巧2: 监听 canplay 事件
    loadingAudio.addEventListener('canplay', onCanPlay)

    // 技巧3: 立即尝试取消静音并播放
    setTimeout(delayedPlay, 100)

    console.log('[audio] 音频已初始化，尝试自动播放...')
  }

  // 组件挂载后初始化
  onMounted(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initLoadingAudio)
    } else {
      initLoadingAudio()
    }
  })

  // 组件卸载时清理
  onUnmounted(() => {
    if (loadingAudio) {
      loadingAudio.removeEventListener('play', onPlay)
      loadingAudio.removeEventListener('canplay', onCanPlay)
    }
  })

  return {
    audioUnlocked,
    tryPlayLoadingMusic,
    stopLoadingMusic
  }
}
