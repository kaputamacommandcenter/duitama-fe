<template>
  <div>
    <!-- Card Wrapper -->
    <div
      class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6"
    >
      <!-- Tombol tambah -->
      <div class="flex justify-between items-center mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Kategori</p>
        <button
          class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          @click="tambahKategori"
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
              <th>Nama Kategori</th>
              <th class="text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(kategori, index) in kategoriList"
              :key="kategori.id"
              class="hover:bg-blue-50/60 transition"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ kategori.nama }}</td>
              <td class="text-center space-x-2">
                <button
                  class="btn btn-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  @click="editKategori(kategori)"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button
                  class="btn btn-xs bg-red-600 hover:bg-red-700 text-white"
                  @click="hapusKategori(kategori.id)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="kategoriList.length === 0">
              <td colspan="4" class="text-center text-gray-500 py-4">
                Belum ada data kategori
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
const kategoriList = ref([
  { id: 1, nama: "UKT S1 Pagi" },
  { id: 2, nama: "UKT S1 Sore" },
  { id: 3, nama: "UKT S1 Karyawan" },
  { id: 4, nama: "UKT D3 MI Pagi" },
  { id: 5, nama: "UKT D3 KA Pagi" },
  { id: 6, nama: "Biaya Pengembangan S1 (Pagi/Sore)" },
  { id: 7, nama: "Biaya Pengembangan D3" },
  { id: 8, nama: "Biaya MOMB" },
  { id: 9, nama: "Biaya Seragam (2 buah)" },
])

// Fungsi tombol aksi
const tambahKategori = () => {
  alert("Fitur tambah kategori akan dibuat di sini.")
}

const editKategori = (kategori) => {
  alert(`Edit kategori: ${kategori.nama}`)
}

const hapusKategori = (id) => {
  if (confirm("Yakin ingin menghapus kategori ini?")) {
    kategoriList.value = kategoriList.value.filter((k) => k.id !== id)
  }
}
</script>
