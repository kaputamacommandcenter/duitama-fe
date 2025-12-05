import { createRouter, createWebHistory } from 'vue-router'
import { api } from '../api/config'

// Daftar route
const routes = [
  // === Public Routes ===
  { path: '/', redirect: '/login' },
  {
    path: '/login', name: 'login', component: () => import('../pages/LoginPage.vue'),
    meta: {
      title: 'DUITAMA | Login',
    }
   },
  {
    path: '/otp', name: 'otp', component: () => import('../pages/OtpVerification.vue'),
    meta: {
      title: 'DUITAMA | Verifikasi OTP',
    }
   },
  {
    path: '/forgot-password', name: 'forgot-password', component: () => import('../pages/ForgotPassword.vue'),
    meta: {
      title: 'DUITAMA | Lupa Password',
    }
   },
  {
    path: '/reset-password', name: 'reset-password', component: () => import('../pages/ResetPassword.vue'),
    meta: {
      title: 'DUITAMA | Reset Password',
    }
   },

{
  path: '/dashboard', name: 'dashboard', component: () => import('../layouts/DashboardLayout.vue'),
  meta: {
    title: 'DUITAMA | Dashboard',
    requiresAuth: true,
    breadcrumb: [
      { name: "Dashboard", link: "/dashboard" }
    ]
  },
  children: [
    {
      path: '', name: 'dashboard-home', component: () => import('../pages/DashboardHome.vue'),
      meta: {
        title: 'DUITAMA | Dashboard',
        breadcrumb: [
          { name: "Dashboard" }
        ]
      }
    },
    // Generate Tagihan (Diperbaiki: path: 'generate-tagihan')
    {
      path: 'generate-tagihan', name: 'generate-tagihan', component: () => import('../pages/GenerateTagihanPage.vue'),
      meta: {
        title: 'DUITAMA | Generate Tagihan',
        breadcrumb: [
          { name: "Dashboard" },
          { name: "Generate Tagihan" }
        ]
      }
    },
    {
      path: 'data-tagihan', name: 'data-tagihan', component: () => import('../pages/DataTagihanPage.vue'),
      meta: {
        title: 'DUITAMA | Data Tagihan',
        breadcrumb: [
          { name: "Dashboard" },
          { name: "Data Tagihan" }
        ]
      }
    },
    // Template Pembayaran (Diperbaiki: path: 'template-pembayaran')
    {
      path: 'template-pembayaran', name: 'template-pembayaran', component: () => import('../pages/TemplatePembayaranPage.vue'),
      meta: {
        title: 'DUITAMA | Template Pembayaran',
        breadcrumb: [
          { name: "Dashboard", link: "/dashboard" },
          { name: "Template Pembayaran" }
        ]
      }
    },
    {
      path: 'payer-groups', name: 'payer-groups', component: () => import('../pages/payer/PayerGroupsPage.vue'),
      meta: {
        title: 'DUITAMA | Kelompok Pembayar',
        breadcrumb: [
          { name: "Dashboard", link: "/dashboard" },
          { name: "Kelola Pembayar" },
          { name: "Kelompok Pembayar" }
        ]
      }
    },
    {
      path: 'payers', name: 'payers', component: () => import('../pages/payer/PayersPage.vue'),
      meta: {
        title: 'DUITAMA | Data Pembayar',
        breadcrumb: [
          { name: "Dashboard", link: "/dashboard" },
          { name: "Kelola Pembayar" },
          { name: "Data Pembayar" }
        ]
      }
    },
    {
      path: 'payer-group-detail/:id', name: 'payer-group-detail', component: () => import('../pages/payer/PayerGroupDetail.vue'),
      meta: {
        title: 'DUITAMA | Detail Kelompok Pembayar',
        breadcrumb: [
          { name: "Dashboard", link: "/dashboard" },
          { name: "Kelola Pembayar" },
          { name: "Kelompok Pembayar" }
        ]
      }
    },
    {
      path: 'potongan', name: 'potongan', component: () => import('../pages/Potongan.vue'),
      meta: {
        title: 'DUITAMA | Potongan',
        breadcrumb: [
          { name: "Dashboard", link: "/dashboard" },
          { name: "Kelola Pembayaran" },
          { name: "Potongan" }
        ]
      }
    },
    // Profil (Sudah benar)
    {
      path: 'profile', name: 'profile', component: () => import('../pages/ProfilePage.vue'),
      meta: { /* ... */ }
    },
  ],
},
// ...,

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
