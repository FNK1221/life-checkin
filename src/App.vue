<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div id="app-root">
    <router-view />
  </div>
</template>

<style>
  /* 全局样式将在单独CSS文件中定义 */
</style>
