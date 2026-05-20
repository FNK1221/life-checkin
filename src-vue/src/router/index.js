import { createRouter, createWebHistory } from 'vue-router'
import TimelineView from '../views/TimelineView.vue'
import StatsView from '../views/StatsView.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
