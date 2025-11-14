<template>
  <div>
    <!-- Card Wrapper -->
    <div
      class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6"
    >
      <!-- Tombol tambah -->
      <div class="flex justify-between items-center mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Kelompok</p>
        <button
          class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          @click="tambahKelompok"
        >
          <i class="fa-solid fa-plus mr-1"></i> Tambah
        </button>
      </div>

      <!-- Tabel -->
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-blue-50 text-blue-900">
              <th class="w-12 text-center">No</th>
              <th>Nama Kelompok</th>
              <th class="text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(kelompok, index) in kelompokList"
              :key="kelompok.id"
              class="hover:bg-blue-50/60 transition"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <RouterLink :to="`kelompok/detail/${kelompok.nama}`" class="text-blue-600 hover:underline">
                {{ kelompok.nama }}
                </RouterLink>
              </td>
              <td class="text-center space-x-2">
                <button
                  class="btn btn-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  @click="editKelompok(kelompok)"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button
                  class="btn btn-xs bg-red-600 hover:bg-red-700 text-white"
                  @click="hapusKelompok(kelompok.id)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="kelompokList.length === 0">
              <td colspan="4" class="text-center text-gray-500 py-4">
                Belum ada data kelompok
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"

// Contoh data (bisa diganti dari API)
const kelompokList = ref([
  { id: 1, nama: "SI&TI 2025 Pagi" },
  { id: 2, nama: "SI&TI 2025 Sore" },
  { id: 3, nama: "SI&TI 2025 Karyawan" },
  { id: 3, nama: "BD 2025 Pagi" },
  { id: 3, nama: "BD 2025 Sore" },
  { id: 4, nama: "MI 2025" },
  { id: 6, nama: "KA 2025" },
])

// Fungsi tombol aksi
const tambahKelompok = () => {
  alert("Fitur tambah kelompok akan dibuat di sini.")
}

const editKelompok = (kelompok) => {
  alert(`Edit kelompok: ${kelompok.nama}`)
}

const hapusKelompok = (id) => {
  if (confirm("Yakin ingin menghapus kelompok ini?")) {
    kelompokList.value = kelompokList.value.filter((k) => k.id !== id)
  }
}
</script>
