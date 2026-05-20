import { createRouter, createWebHashHistory } from 'vue-router'
import TimelineView from '@/views/TimelineView.vue'

const routes = [
  {
    path: '/',
    name: 'timeline',
    component: TimelineView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
