import { createRouter, createWebHistory } from 'vue-router'
import { api } from '../api/config'

// Daftar route
const routes = [
  // === Public Routes ===
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: () => import('../pages/LoginPage.vue') },
  { path: '/otp', name: 'otp', component: () => import('../pages/OtpVerification.vue') },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('../pages/ForgotPassword.vue') },
  { path: '/reset-password', name: 'reset-password', component: () => import('../pages/ResetPassword.vue') },

  // === Protected Routes (hanya bisa diakses kalau sudah login) ===
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard-home',
        component: () => import('../pages/DashboardHome.vue'),
      },
      {
        path: 'kategori',
        name: 'kategori',
        component: () => import('../pages/manajemen/KategoriPage.vue'),
      },
      {
        path: 'item',
        name: 'item-pembayaran',
        component: () => import('../pages/manajemen/ItemPembayaranPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../pages/ProfilePage.vue'),
      },
    ],
  },

  // === Not Found ===
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/* ============================================================
   🛡️ ROUTE GUARD UNTUK MELINDUNGI HALAMAN DASHBOARD
   ============================================================ */
router.beforeEach(async (to, next) => {
  const token = localStorage.getItem('access_token')

  // Jika route butuh login
  if (to.meta.requiresAuth) {
    if (!token) {
      // Jika belum login → arahkan ke halaman login
      return next({ name: 'login' })
    }

    try {
      // ✅ Verifikasi token ke server (pastikan endpoint ini ada di backend)
      const res = await api.get('/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.data.success) {
        // Jika token valid → lanjut
        next()
      } else {
        // Jika token tidak valid → hapus data & arahkan ke login
        localStorage.clear()
        next({ name: 'login' })
      }
    } catch (error) {
      // Jika token tidak valid / request gagal → logout otomatis
      localStorage.clear()
      next({ name: 'login' })
    }
  } else {
    // Jika user sudah login tapi buka halaman login → redirect ke dashboard
    if ((to.name === 'login' || to.name === 'otp') && token) {
      return next({ name: 'dashboard-home' })
    }

    next()
  }
})

export default router
