import { createRouter, createWebHistory } from 'vue-router'
import TimelineView from '../views/TimelineView.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
