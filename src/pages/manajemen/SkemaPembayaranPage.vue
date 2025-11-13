<template>
  <div>
    <!-- Card Wrapper -->
    <div class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6">
      <!-- Tombol tambah -->
      <div class="flex justify-between items-center mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Skema Pembayaran</p>
        <button class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm" @click="tambahPotongan">
          <i class="fa-solid fa-plus mr-1"></i> Tambah
        </button>
      </div>

      <!-- Tabel -->
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-blue-50 text-blue-900">
              <th class="w-12 text-center">No</th>
              <th>Kelompok</th>
              <th>Kategori</th>
              <th>Jenis Potongan</th>
              <th class="text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(potongan, index) in skemaPembayaranList" :key="potongan.id" class="hover:bg-blue-50/60 transition">
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ potongan.namaKelompok }}</td>
              <td>{{ potongan.kategori }}</td>
              <td>{{ potongan.namaPotongan }}</td>
              <td class="text-center space-x-2">
                <button class="btn btn-xs bg-yellow-500 hover:bg-yellow-600 text-white" @click="editPotongan(potongan)">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-xs bg-red-600 hover:bg-red-700 text-white" @click="hapusPotongan(potongan.id)">
                  <i class="fa-solid fa-trash"></i>
                </button>
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

const skemaPembayaranList = ref([
  {id: 1, namaKelompok: "SI-2025-Pagi-Reguler", kategori: "UKT S1 Pagi", namaPotongan: "-"},
  {id: 2, namaKelompok: "SI-2025-Pagi-Reguler", kategori: "Biaya Pengembangan S1 (Pagi/Sore)", namaPotongan: "-"},
  {id: 3, namaKelompok: "SI-2025-Pagi-Reguler", kategori: "Biaya MOMB", namaPotongan: "-"},
  {id: 4, namaKelompok: "SI-2025-Pagi-Reguler", kategori: "Biaya Seragam (2 buah)", namaPotongan: "-"}
])

const tambahPotongan = () => {
  alert("Fitur tambah potongan akan dibuat di sini.")
}

const editPotongan = (potongan) => {
  alert(`Edit potongan: ${potongan.nama}`)
}

const hapusPotongan = (id) => {
  if (confirm("Yakin ingin menghapus potongan ini?")) {
    potonganList.value = potonganList.value.filter((k) => k.id !== id)
  }
}
</script>
