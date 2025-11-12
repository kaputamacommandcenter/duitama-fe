<template>
  <div class="flex h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-blue-100 overflow-hidden">
    <Sidebar
      :is-sidebar-open="isSidebarOpen"
      :window-width="windowWidth"
      @close-sidebar="isSidebarOpen = false"
      @logout="handleLogout"
    />

    <transition name="fade">
      <div
        v-if="isSidebarOpen && windowWidth < 768"
        class="fixed inset-0 bg-black/30 z-30 md:hidden"
        @click="isSidebarOpen = false"
      ></div>
    </transition>

    <div class="flex-1 flex flex-col min-w-0">
      <header
        class="bg-white/60 backdrop-blur-md shadow-md p-4 flex justify-between items-center sticky top-0 z-20 border-b border-sky-100"
      >
        <button
          @click="isSidebarOpen = !isSidebarOpen"
          class="md:hidden text-sky-700 font-semibold"
        >
          <i class="fa-solid fa-bars text-xl mr-1"></i>
          Dashboard
        </button>

        <h2 class="hidden md:block text-lg font-semibold text-sky-700">Dashboard</h2>

        <div class="relative">
          <button
            @click="toggleDropdown"
            class="flex items-center space-x-2 hover:bg-sky-50 px-3 py-2 rounded-lg transition"
          >
            <div
              class="bg-gradient-to-br from-sky-100 to-emerald-100 w-9 h-9 rounded-full border border-sky-200 flex items-center justify-center"
            >
              <i class="fa fa-user text-sky-700"></i>
            </div>
            <span class="hidden md:inline font-semibold text-sky-800">{{ userName }}</span>
            <i
              class="fa-solid fa-chevron-down text-sky-600 text-sm transition-transform"
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
              class="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md border border-sky-100 rounded-xl shadow-lg py-2 z-50"
            >
              <RouterLink
                to="/dashboard/profile"
                class="block px-4 py-2 text-sky-700 hover:bg-sky-50 rounded-md"
              >
                <i class="fa-solid fa-user mr-2"></i> Profil Saya
              </RouterLink>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <i class="fa-solid fa-right-from-bracket mr-2"></i> Keluar
              </button>
            </div>
          </transition>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto px-6 py-4">
        <transition name="fade" mode="out-in">
          <div
            :key="route.fullPath"
            class="text-sm breadcrumbs mb-5 p-3 rounded-xl bg-white/60 backdrop-blur-md border border-sky-200 shadow-sm"
          >
            <ul class="text-sky-700 font-medium">
              <li>
                <RouterLink to="/dashboard" class="hover:text-emerald-600 transition">
                  <i class="fa-solid fa-house mr-1 text-sky-600"></i> Beranda
                </RouterLink>
              </li>
              <li v-for="(item, i) in breadcrumbs" :key="i">
                <RouterLink
                  v-if="item.link"
                  :to="item.link"
                  class="capitalize hover:text-emerald-600 transition"
                >
                  {{ item.name }}
                </RouterLink>
                <span v-else class="capitalize text-sky-900 font-semibold">
                  {{ item.name }}
                </span>
              </li>
            </ul>
          </div>
        </transition>

        <transition name="fade" mode="out-in">
          <router-view :key="route.fullPath" />
        </transition>
      </main>

      <footer class="bg-white/60 backdrop-blur-md shadow-md p-4">
        <p class="text-sm text-sky-700">
          &copy; {{ year }} Duitama by Kaputama Command Centre. All rights reserved.
        </p>
      </footer>

      <LoadingOverlay />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue"
import { api } from "../api/config"
import { useRouter, useRoute } from "vue-router"
import LoadingOverlay from "../components/LoadingOverlay.vue"
import { showLoading, hideLoading } from "../stores/loading"
// Import komponen Sidebar
import Sidebar from "../components/Sidebar.vue" // Sesuaikan path ini jika perlu

const router = useRouter()
const route = useRoute()

const year = new Date().getFullYear()
const isSidebarOpen = ref(false)
const isDropdownOpen = ref(false)
const userName = ref(localStorage.getItem("name") || "")
const windowWidth = ref(window.innerWidth)

// Fungsi `activeClass` dan `toggleMenu` dipindahkan ke Sidebar.vue
// Variabel `openMenu` juga dipindahkan ke Sidebar.vue

// breadcrumb dinamis
const breadcrumbs = computed(() => {
  const segments = route.path.split("/").filter(Boolean)
  const paths: { name: string; link?: string }[] = []

  segments.forEach((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/")
    const name = segment.replace(/-/g, " ")
    paths.push({ name, link: index < segments.length - 1 ? path : undefined })
  })

  return paths
})

// logout
const handleLogout = async () => {
  try {
    showLoading("Sedang keluar...")
    const token = localStorage.getItem("access_token")
    if (token) {
      await api.post("/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    localStorage.clear()
    await new Promise((r) => setTimeout(r, 1200))
    router.push("/login")
  } catch {
    alert("Gagal logout.")
  } finally {
    hideLoading()
  }
}

const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value)
const updateWindowWidth = () => (windowWidth.value = window.innerWidth)

onMounted(() => {
  window.addEventListener("resize", updateWindowWidth)
  document.addEventListener("click", (e) => {
    const dropdown = document.querySelector(".relative")
    if (dropdown && !dropdown.contains(e.target as Node)) {
      isDropdownOpen.value = false
    }
  })
})
onBeforeUnmount(() => window.removeEventListener("resize", updateWindowWidth))
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");

/* Hanya transisi fade yang relevan untuk overlay dan content */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>