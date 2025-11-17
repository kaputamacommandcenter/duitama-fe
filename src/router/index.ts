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

  // =======================================================
  // PROTECTED ROUTES
  // =======================================================
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../layouts/DashboardLayout.vue'),
    meta: {
      requiresAuth: true,
      breadcrumb: [
        { name: "Dashboard", link: "/dashboard" }
      ]
    },
    children: [

      // Home
      {
        path: '',
        name: 'dashboard-home',
        component: () => import('../pages/DashboardHome.vue'),
        meta: {
          breadcrumb: [
            { name: "Dashboard" }
          ]
        }
      },

      // Kategori
      {
        path: 'kategori',
        name: 'kategori',
        component: () => import('../pages/manajemen/KategoriPage.vue'),
        meta: {
          breadcrumb: [
            { name: "Dashboard", link: "/dashboard" },
            { name: "Kategori" }
          ]
        }
      },

      // Item Pembayaran
      {
        path: 'item',
        name: 'item-pembayaran',
        component: () => import('../pages/manajemen/ItemPembayaranPage.vue'),
        meta: {
          breadcrumb: [
            { name: "Dashboard", link: "/dashboard" },
            { name: "Item Pembayaran" }
          ]
        }
      },

      // Potongan
      {
        path: 'potongan',
        name: 'potongan',
        component: () => import('../pages/manajemen/PotonganPage.vue'),
        meta: {
          breadcrumb: [
            { name: "Dashboard", link: "/dashboard" },
            { name: "Potongan" }
          ]
        }
      },

      // Skema Pembayaran
      {
        path: 'skema-pembayaran',
        name: 'skema-pembayaran',
        component: () => import('../pages/manajemen/SkemaPembayaranPage.vue'),
        meta: {
          breadcrumb: [
            { name: "Dashboard", link: "/dashboard" },
            { name: "Skema Pembayaran" }
          ]
        }
      },

      // Kelompok
      {
        path: 'kelompok',
        name: 'kelompok',
        component: () => import('../pages/manajemen/KelompokPage.vue'),
        meta: {
          breadcrumb: [
            { name: "Dashboard", link: "/dashboard" },
            { name: "Kelompok" }
          ]
        }
      },

      // Detail Kelompok
      {
        path: 'kelompok/detail/:id',
        name: 'detail-kelompok',
        component: () => import('../pages/manajemen/KelompokDetailPage.vue'),
        meta: {
          breadcrumb: [
            { name: "Dashboard", link: "/dashboard" },
            { name: "Kelompok", link: "/dashboard/kelompok" },
            { name: "Detail Kelompok" }
          ]
        }
      },

      // Profil
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../pages/ProfilePage.vue'),
        meta: {
          breadcrumb: [
            { name: "Dashboard", link: "/dashboard" },
            { name: "Profil Saya" }
          ]
        }
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
router.beforeEach(async (to) => {
  const token = localStorage.getItem('access_token')

  // Jika route butuh login
  if (to.meta.requiresAuth) {
    if (!token) return { name: 'login' }

    try {
      const res = await api.get('/user', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.data.success) {
        localStorage.clear()
        return { name: 'login' }
      }

    } catch (error) {
      localStorage.clear()
      return { name: 'login' }
    }
  } else {
    // Jika sudah login dan buka halaman login/OTP → redirect ke dashboard
    if ((to.name === 'login' || to.name === 'otp') && token) {
      return { name: 'dashboard-home' }
    }
  }

  return true
})

export default router
