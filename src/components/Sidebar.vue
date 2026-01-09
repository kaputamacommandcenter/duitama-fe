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

      <nav class="mt-4 space-y-4 px-2 overflow-y-auto">
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

          <div v-else class="space-y-1">
            <h3
              class="px-3 py-2 text-sm font-semibold text-white/70 tracking-wider uppercase border-b border-white/20 mb-1 cursor-default"
              :class="{ 'text-white': isParentActive(item.children) }"
            >
              <i :class="[item.icon, 'w-4 mr-2']"></i> {{ item.name }}
            </h3>

            <div class="ml-4 space-y-1">
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
import { useRoute } from 'vue-router'

const route = useRoute()

// Tipe data menu
interface MenuItem {
  id: string
  name: string
  icon: string
  link?: string
  children?: MenuItem[]
}

// Data menu utama yang direvisi: Beranda dipisah ke atas
const menuItems: MenuItem[] = [
  // ITEM TUNGGAL: BERANDA (Ditempatkan di paling atas)
  { id: "beranda", name: "Beranda", icon: "fa-solid fa-house", link: "/dashboard" },

  // KELOMPOK 1: TRANSAKSI UTAMA (Dihapus Beranda)
  {
    id: "transaksi-utama",
    name: "Transaksi Utama",
    icon: "fa-solid fa-file-invoice-dollar", 
    children: [
      { id: "rencana-pembayaran", name: "Rencana Pembayaran", icon: "fa-solid fa-file-invoice", link: "/dashboard/rencana-pembayaran" },
      { id: "daftar-tagihan", name: "Daftar Tagihan", icon: "fa-solid fa-file-invoice", link: "/dashboard/daftar-tagihan" },
    ]
  },
  
  // KELOMPOK 2: MANAJEMEN PEMBAYAR (MASTER DATA)
  {
    id: "manajemen-pembayar",
    name: "Manajemen Pembayar",
    icon: "fa-solid fa-users",
    children: [
      { id: "payers", name: "Data Pembayar", icon: "fa-solid fa-user-friends", link: "/dashboard/payers" },
      { id: "payer-groups", name: "Kelompok Pembayar", icon: "fa-solid fa-layer-group", link: "/dashboard/payer-groups" },
    ]
  },

  // KELOMPOK 3: KONFIGURASI TRANSAKSI (Pengaturan/Template)
  {
    id: "konfigurasi-transaksi",
    name: "Konfigurasi Transaksi",
    icon: "fa-solid fa-sliders",
    children: [
      { id: "template-pembayaran", name: "Template Pembayaran", icon: "fa-solid fa-file-alt", link: "/dashboard/template-pembayaran" },
      { id: "potongan", name: "Pengelolaan Potongan", icon: "fa-solid fa-tags", link: "/dashboard/potongan" },
    ]
  },
]

// Props (Tidak berubah)
defineProps<{
  isSidebarOpen: boolean
  windowWidth: number
}>()

const emit = defineEmits(["close-sidebar", "logout"])


// Kelas aktif (Tidak berubah)
const activeClass = (path?: string): string => {
  if (!path) return ""
  return route.path === path ? "bg-white text-sky-700 font-bold shadow-inner" : ""
}

// Cek apakah parent aktif (Digunakan hanya untuk memberikan gaya pada judul grup)
const isParentActive = (children?: MenuItem[]): boolean => {
  if (!children) return false
  return children.some((child) => route.path === child.link)
}
</script>

<style scoped>
/* Transisi Sidebar: Tetap sama */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
/* Hapus transisi `.fade` karena tidak ada dropdown */
</style>