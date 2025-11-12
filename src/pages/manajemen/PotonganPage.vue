<template>
  <div>
    <!-- Card Wrapper -->
    <div
      class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6"
    >
      <!-- Tombol tambah -->
      <div class="flex justify-between items-center mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Potongan</p>
        <button
          class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          @click="tambahPotongan"
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
              <th>Nama Potongan</th>
              <th>Periode Mulai</th>
              <th>Periode Akhir</th>
              <th>Nominal</th>
              <th>Persen (%)</th>
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
              <td>Rp {{ formatNominal(potongan.nominal) }}</td>
              <td>{{ potongan.persen }}</td>
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
              <td colspan="4" class="text-center text-gray-500 py-4">
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

// Contoh data (bisa diganti dari API)
const potonganList = ref([
  { id: 1, nama: "Alumni STMIK Kaputama/P3IK Kaputama", periodeMulai: "Tahun Ke-1", periodeAkhir: "Tahun Ke-4", nominal: '-', persen: 20 },
  { id: 2, nama: "Saudara Kandung (Khusus S1) - Lunas Tahun Pertama", periodeMulai: "Tahun Ke-1", periodeAkhir: "Tahun Ke-1", nominal: '-', persen: 20 },
  { id: 2, nama: "Saudara Kandung (Khusus S1) - Cicil Tahun Pertama", periode: "1 Tahun", nominal: '-', persen: 15 },
  { id: 3, nama: "Saudara Kandung (Khusus S1) - Lunas Tahun Kedua s.d Semester 8", periode: "3 Tahun", nominal: '-', persen: 10 },
  { id: 4, nama: "Saudara Kandung (Khusus S1) - Cicilan Tahun Kedua s.d Semester 8", periode: "3 Tahun", nominal: '-', persen: 7.5 },
  { id: 5, nama: "Guru/Anak Guru (Khusus S1) - Lunas Tahun Pertama", periode: "1 Tahun", nominal: '-', persen: 20 },
  { id: 6, nama: "Guru/Anak Guru (Khusus S1) - Cicil Tahun Pertama", periode: "1 Tahun", nominal: '-', persen: 15 },
  { id: 7, nama: "Guru/Anak Guru (Khusus S1) - Lunas Tahun Kedua s.d Semester 8", periode: "3 Tahun", nominal: '-', persen: 10 },
  { id: 8, nama: "Guru/Anak Guru (Khusus S1) - Cicil Tahun Kedua s.d Semester 8", periode: "3 Tahun", nominal: '-', persen: 7.5 },
  { id: 9, nama: "Mahasiswa Berprestasi Non Akademik", periode: "1 Tahun", nominal: '-', persen: 20 },
  { id: 10, nama: "Beasiswa Tahfidz Al-Qur'an 8 Semester", periode: "4 Tahun", nominal: '-', persen: 10 },
  { id: 11, nama: "Beasiswa Difabel 8 Semester", nominal: '-', persen: 10 },
  { id: 12, nama: "Beasiswa Yatim Piatu 8 Semester", nominal: '-', persen: 10 },
  { id: 13, nama: "Siswa Berprestasi di Tiap Sekolah (Ranking I)", nominal: 600000, persen: '-' },
  { id: 14, nama: "Siswa Berprestasi di Tiap Sekolah (Ranking II)", nominal: 400000, persen: '-' },
  { id: 15, nama: "Siswa Berprestasi di Tiap Sekolah (Ranking III)", nominal: 300000, persen: '-' },
  { id: 16, nama: "Pendaftaran Sebelum Ujian SNMPTN/SBMPTN - Tahun Pertama", nominal: '-', persen: 15 },
  { id: 17, nama: "Pendaftaran Sebelum Ujian Akhir Sekolah - Tahun Pertama", nominal: '-', persen: 30 },
  { id: 18, nama: "Membayaran Lunas Biaya Kuliah 1 Tahun", nominal: '-', persen: 20 },
])

const formatNominal = (value) => {
  return value.toLocaleString("id-ID")
}

// Fungsi tombol aksi
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
