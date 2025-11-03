import { createRouter, createWebHistory } from 'vue-router'

// Gunakan lazy load (dynamic import) untuk efisiensi
const routes = [
  { path: '/', component: () => import('../pages/LoginPage.vue') },
  { path: '/login', component: () => import('../pages/LoginPage.vue') },
  { path: '/forgot-password', component: () => import('../pages/ForgotPassword.vue') },
  { path: '/reset-password', component: () => import('../pages/ResetPassword.vue') },
  { path: '/otp', component: () => import('../pages/OtpVerification.vue') },

  // Tambahkan route wildcard di paling bawah
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
