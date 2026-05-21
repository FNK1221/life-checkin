import { createRouter, createWebHistory } from 'vue-router'
import TimelineView from '../views/TimelineView.vue'
import StatsView from '../views/StatsView.vue'
import MemoryView from '../views/MemoryView.vue'

const routes = [
  {
    path: '/',
    name: 'Timeline',
    component: TimelineView
  },
  {
    path: '/chapter/:id',
    name: 'Chapter',
    component: TimelineView,
    props: true
  },
  {
    path: '/stats',
    name: 'Stats',
    component: StatsView
  },
  {
    path: '/memory',
    name: 'Memory',
    component: MemoryView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
