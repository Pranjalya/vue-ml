import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/objectdetection',
    name: 'objectdetection',
    component: () => import('../views/ObjectDetection.vue')
  },
  {
    path: '/sentimentanalysis',
    name: 'sentimentanalysis',
    component: () => import('../views/SentimentAnalysis.vue')
  },
  {
    path: '/emotiondetection',
    name: 'emotiondetection',
    component: () => import('../views/EmotionDetection.vue')
  },
  {
    path: '/speechcommand',
    name: 'speechcommand',
    component: () => import('../views/SpeechCommandDetection.vue')
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
