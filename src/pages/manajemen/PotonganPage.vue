<template>
  <div>
    <!-- Card Wrapper -->
    <div class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6">
      <!-- Tombol tambah -->
      <div class="flex justify-between items-center mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Potongan</p>
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
              <th>Nama Potongan</th>
              <th>Tahun Mulai</th>
              <th>Tahun Akhir</th>
              <th>Nilai Potongan</th>
              <th>Jenis Potongan</th>
              <th class="text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(potongan, index) in potonganList"
              :key="potongan.id"
              class="hover:bg-blue-50/60 transition"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ potongan.nama }}</td>
              <td>{{ potongan.periodeMulai }}</td>
              <td>{{ potongan.periodeAkhir }}</td>
              <td>
                <span v-if="potongan.jenisPotongan === 'Persentase'">{{ potongan.nilaiPotongan }}%</span>
                <span v-else>Rp {{ formatNominal(potongan.nilaiPotongan) }}</span>
              </td>
              <td>{{ potongan.jenisPotongan }}</td>
              <td class="text-center space-x-2">
                <button
                  class="btn btn-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  @click="editPotongan(potongan)"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button
                  class="btn btn-xs bg-red-600 hover:bg-red-700 text-white"
                  @click="hapusPotongan(potongan.id)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="potonganList.length === 0">
              <td colspan="7" class="text-center text-gray-500 py-4">
                Belum ada data potongan
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

const potonganList = ref([
  { id: 1, nama: "Alumni STMIK Kaputama / P3IK Kaputama", periodeMulai: "1", periodeAkhir: "1", nilaiPotongan: 20, jenisPotongan: "Persentase" },
  { id: 2, nama: "Saudara Kandung (Khusus S1) - Tahun Pertama", periodeMulai: "2", periodeAkhir: "4", nilaiPotongan: 15, jenisPotongan: "Persentase" },
  { id: 3, nama: "Saudara Kandung (Khusus S1) - Tahun Kedua sampai semester 8", periodeMulai: "2", periodeAkhir: "4", nilaiPotongan: 7.5, jenisPotongan: "Persentase" },
  { id: 4, nama: "Guru / Anak Guru (Khusus S1) - Tahun Pertama", periodeMulai: "1", periodeAkhir: "1", nilaiPotongan: 15, jenisPotongan: "Persentase" },
  { id: 5, nama: "Guru / Anak Guru (Khusus S1) - Tahun Kedua sampai semester 8", periodeMulai: "2", periodeAkhir: "4", nilaiPotongan: 7.5, jenisPotongan: "Persentase" },
  { id: 6, nama: "Mahasiswa Berprestasi Non Akademik Jalur Beasiswa", periodeMulai: "1", periodeAkhir: "4", nilaiPotongan: 10, jenisPotongan: "Persentase" },
  { id: 7, nama: "Beasiswa Tahfiz Al-Quran", periodeMulai: "1", periodeAkhir: "4", nilaiPotongan: 10, jenisPotongan: "Persentase" },
  { id: 8, nama: "Beasiswa Yatim Piatu", periodeMulai: "1", periodeAkhir: "4", nilaiPotongan: 10, jenisPotongan: "Persentase" },
  { id: 9, nama: "Siswa Berprestasi di Tiap Sekolah Ranking I", periodeMulai: "1", periodeAkhir: "1", nilaiPotongan: 400000, jenisPotongan: "Nominal" },
  { id: 10, nama: "Siswa Berprestasi di Tiap Sekolah Ranking II", periodeMulai: "1", periodeAkhir: "1", nilaiPotongan: 400000, jenisPotongan: "Nominal" },
  { id: 11, nama: "Siswa Berprestasi di Tiap Sekolah Ranking III", periodeMulai: "1", periodeAkhir: "1", nilaiPotongan: 300000, jenisPotongan: "Nominal" },
  { id: 12, nama: "Pendaftaran Sebelum Ujian SNMPTN/SBMPN", periodeMulai: "1", periodeAkhir: "1", nilaiPotongan: 15, jenisPotongan: "Persentase" },
  { id: 13, nama: "Pendaftaran Sebelum Ujian Akhir Sekolah", periodeMulai: "1", periodeAkhir: "1", nilaiPotongan: 30, jenisPotongan: "Persentase" },
])

const formatNominal = (value) => {
  return value.toLocaleString("id-ID")
}

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
