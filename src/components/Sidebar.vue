<template>
  <transition name="slide">
    <aside
      v-show="isSidebarOpen || windowWidth >= 768"
      class="fixed inset-y-0 left-0 w-64 bg-linear-to-b from-sky-700 via-sky-600 to-emerald-600 text-white shadow-2xl z-40 md:static md:flex md:flex-col"
    >
      <div class="p-4 flex items-center justify-between md:justify-start border-b border-white/20">
        <div class="flex items-center space-x-2">
          <img src="/duitama-logo.png" alt="DUITAMA" class="w-9 h-9 drop-shadow-md" />
          <h1 class="text-lg font-bold tracking-wide">DUITAMA</h1>
        </div>
        <button
          @click="$emit('close-sidebar')"
          class="md:hidden text-white/70 hover:text-white transition"
        >
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <nav class="mt-4 space-y-2 px-2">
        <template v-for="item in menuItems" :key="item.id">
          <RouterLink
            v-if="!item.children"
            :to="item.link ?? '/'"
            class="flex items-center px-3 py-2 rounded-lg transition-all duration-200"
            :class="[
              activeClass(item.link),
              route.path !== item.link ? 'text-white/90 hover:text-white hover:bg-white/10' : ''
            ]"
            @click="$emit('close-sidebar')"
          >
            <i :class="[item.icon, 'w-5 mr-3']"></i> {{ item.name }}
          </RouterLink>

          <div v-else>
            <button
              @click="toggleMenu(item.id)"
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200"
              :class="[
                { 'bg-white/20': openMenu === item.id },
                isParentActive(item.children)
                  ? 'bg-white text-sky-700 font-bold shadow-inner'
                  : 'hover:bg-white/10'
              ]"
            >
              <div class="flex items-center">
                <i :class="[item.icon, 'w-5 mr-1']"></i>
                <span>{{ item.name }}</span>
              </div>
              <i
                class="fa-solid fa-chevron-down text-xs transition-transform"
                :class="{ 'rotate-180': openMenu === item.id }"
              ></i>
            </button>

            <transition name="fade">
              <div
                v-if="openMenu === item.id || isParentActive(item.children)"
                class="ml-8 mt-1 space-y-1"
              >
                <RouterLink
                  v-for="subitem in item.children"
                  :key="subitem.id"
                  :to="subitem.link ?? '/'"
                  class="block px-3 py-1.5 rounded-lg transition"
                  :class="[
                    activeClass(subitem.link),
                    route.path !== subitem.link ? 'text-white/90 hover:bg-white/20' : ''
                  ]"
                  @click="$emit('close-sidebar')"
                >
                  <i :class="[subitem.icon, 'w-4 mr-2']"></i> {{ subitem.name }}
                </RouterLink>
              </div>
            </transition>
          </div>
        </template>
      </nav>

      <div class="mt-auto p-4 md:hidden border-t border-white/20">
        <button
          @click="$emit('logout')"
          class="w-full flex items-center text-white hover:text-yellow-300 font-semibold transition"
        >
          <i class="fa-solid fa-right-from-bracket mr-2"></i> Keluar
        </button>
      </div>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

// Tipe data menu
interface MenuItem {
  id: string
  name: string
  icon: string
  link?: string
  children?: MenuItem[]
}

// Data menu utama
const menuItems: MenuItem[] = [
  {id: "beranda",name: "Beranda",icon: "fa-solid fa-house",link: "/dashboard"},
  {
    id: "pembayaran", name: "Manajemen Pembayaran", icon: "fa-solid fa-credit-card",
    children: [
      {id: "kategori",name: "Kategori",icon: "fa-solid fa-layer-group",link: "/dashboard/kategori"},
      {id: "item",name: "Item Pembayaran",icon: "fa-solid fa-list",link: "/dashboard/item"},
      {id: "potongan",name: "Potongan",icon: "fa-solid fa-tag",link: "/dashboard/potongan"},
      {id: "kelompok",name: "Kelompok",icon: "fa-solid fa-users",link: "/dashboard/kelompok"},
      {id: "skema-pembayaran",name: "Skema Pembayaran",icon: "fa-solid fa-scale-balanced",link: "/dashboard/skema-pembayaran"},
    ],
  },
  {
    id: "master-data", name: "Master Data", icon: "fa-solid fa-database",
    children: [
      {id: "data-mahasiswa",name: "Data Mahasiswa",icon: "fa-solid fa-user-graduate",link: "/dashboard/data-mahasiswa"},
      {id: "program-studi",name: "Program Studi",icon: "fa-solid fa-graduation-cap",link: "/dashboard/program-studi"},
    ],
  },
]

// PERBAIKAN 1: Hapus `const props` dan `eslint-disable`
defineProps<{
  isSidebarOpen: boolean
  windowWidth: number
}>()

const emit = defineEmits(["close-sidebar", "logout"])

const openMenu = ref<string>("")

// Otomatis buka menu aktif
onMounted(() => {
  const currentPath = route.path
  for (const parent of menuItems) {
    if (parent.children) {
      const isActive = parent.children.some((child) => child.link === currentPath)
      if (isActive) {
        openMenu.value = parent.id
        break
      }
    }
  }
})

// Kelas aktif
const activeClass = (path?: string): string => {
  if (!path) return ""
  return route.path === path ? "bg-white text-sky-700 font-bold shadow-inner" : ""
}

// Toggle dropdown
const toggleMenu = (menuId: string) => {
  openMenu.value = openMenu.value === menuId ? "" : menuId
}

// Cek apakah parent aktif
const isParentActive = (children?: MenuItem[]): boolean => {
  if (!children) return false
  return children.some((child) => route.path === child.link)
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.slide-leave-active {
  transition: opacity 0.5s ease, transform 0.4s ease;
}
.fade-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>