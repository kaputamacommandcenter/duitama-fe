<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- Sidebar -->
    <transition name="slide">
      <aside
        v-show="isSidebarOpen || windowWidth >= 768"
        class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40 md:static md:flex md:flex-col transition-all duration-300"
      >
        <div class="p-4 flex items-center justify-between md:justify-start">
          <div class="flex items-center space-x-2">
            <img src="/duitama-logo.png" alt="DUITAMA" class="w-9 h-9" />
            <h1 class="text-lg font-bold text-gray-800">DUITAMA</h1>
          </div>
          <!-- Tombol close di mobile -->
          <button
            @click="isSidebarOpen = false"
            class="md:hidden text-gray-600 hover:text-gray-800"
          >
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <!-- Navigasi -->
        <nav class="mt-4 space-y-1 px-2">
          <RouterLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-all"
            :class="{
              'bg-blue-500 text-white': route.path === item.path
            }"
            @click="isSidebarOpen = false"
          >
            <i :class="['fa-solid', item.icon, 'w-5 mr-3']"></i>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <!-- Tombol logout (mobile) -->
        <div class="mt-auto p-4 md:hidden">
          <button
            @click="handleLogout"
            class="w-full flex items-center text-red-600 hover:text-red-700 font-semibold"
          >
            <i class="fa-solid fa-right-from-bracket mr-2"></i> Keluar
          </button>
        </div>
      </aside>
    </transition>

    <!-- Overlay gelap ketika sidebar terbuka di mobile -->
    <transition name="fade">
      <div
        v-if="isSidebarOpen && windowWidth < 768"
        class="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
        @click="isSidebarOpen = false"
      ></div>
    </transition>

    <!-- Konten utama -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Navbar -->
      <header
        class="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20"
      >
        <button
          @click="isSidebarOpen = !isSidebarOpen"
          class="md:hidden text-gray-700"
        >
          <i class="fa-solid fa-bars text-xl mr-1"></i>
          <span class="font-semibold text-gray-700">Dashboard</span>
        </button>

        <h2 class="hidden md:block text-lg font-semibold text-gray-800">
          Dashboard
        </h2>

        <!-- Dropdown Profil -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
          >
            <img
              src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
              alt="User Avatar"
              class="w-9 h-9 rounded-full border"
            />
            <span class="hidden md:inline font-semibold text-gray-700">
              {{ userName }}
            </span>
            <i
              class="fa-solid fa-chevron-down text-gray-500 text-sm transition-transform"
              :class="{ 'rotate-180': isDropdownOpen }"
            ></i>
          </button>

          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="isDropdownOpen"
              class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
            >
              <RouterLink
                to="/dashboard/profil"
                class="block px-4 py-2 text-gray-700 hover:bg-blue-50"
              >
                <i class="fa-solid fa-user mr-2"></i> Profil Saya
              </RouterLink>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                <i class="fa-solid fa-right-from-bracket mr-2"></i> Keluar
              </button>
            </div>
          </transition>
        </div>
      </header>

      <!-- Isi konten -->
      <main class="flex-1 overflow-y-auto p-6">
            <router-view />
        </main>
        <LoadingOverlay />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import { api } from "../api/config"
import { useRouter, useRoute } from "vue-router"
import LoadingOverlay from "../components/LoadingOverlay.vue"
import { showLoading, hideLoading } from "../stores/loading"

const router = useRouter()
const route = useRoute()

const isSidebarOpen = ref(false)
const isDropdownOpen = ref(false)
const userName = ref(localStorage.getItem("name") || "")
const windowWidth = ref(window.innerWidth)

const menuItems = [
  { path: "/dashboard", label: "Beranda", icon: "fa-house" },
  { path: "/dashboard/transaksi", label: "Transaksi", icon: "fa-receipt" },
  { path: "/dashboard/laporan", label: "Laporan", icon: "fa-chart-line" },
  { path: "/dashboard/pengaturan", label: "Pengaturan", icon: "fa-gear" },
]

const handleLogout = async () => {
  try {
    showLoading("Sedang keluar...")

    const token = localStorage.getItem("access_token")
    if (token) {
      await api.post("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {})
    }

    localStorage.clear()
    await new Promise((r) => setTimeout(r, 1200))
    router.push("/login")
  } catch (err) {
    alert("Gagal logout.")
  } finally {
    hideLoading()
  }
}


const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener("resize", updateWindowWidth)
  document.addEventListener("click", (e) => {
    const dropdown = document.querySelector(".relative")
    if (dropdown && !dropdown.contains(e.target as Node)) {
      isDropdownOpen.value = false
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateWindowWidth)
})
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
