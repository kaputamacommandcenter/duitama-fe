<template>
  <div>
    <!-- Card Wrapper -->
    <div
      class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6"
    >
      <!-- Tombol tambah -->
      <div class="flex justify-between items-center mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Item Pembayaran</p>
        <button
          class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          @click="tambahItem"
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
              <th>Kategori</th>
              <th>Nama Item</th>
              <th>Nominal</th>
              <th>Tahun Akademik</th>
              <th class="text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in itemList"
              :key="item.id"
              class="hover:bg-blue-50/60 transition"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ item.kategori }}</td>
              <td>{{ item.nama }}</td>
              <td>Rp {{ formatNominal(item.nominal) }}</td>
              <td>{{ item.tahun }}</td>
              <td class="text-center space-x-2">
                <button
                  class="btn btn-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  @click="editItem(item)"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button
                  class="btn btn-xs bg-red-600 hover:bg-red-700 text-white"
                  @click="hapusItem(item.id)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>

            <tr v-if="itemList.length === 0">
              <td colspan="6" class="text-center text-gray-500 py-4">
                Belum ada data item pembayaran
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

// Contoh data sementara (bisa diganti dari API backend)
const itemList = ref([
  {
    id: 1,
    kategori: "UKT S1 Pagi",
    nama: "Cicilan 1",
    nominal: 800000,
    tahun: "2025/2026",
  },
  {
    id: 2,
    kategori: "UKT S1 Pagi",
    nama: "Cicilan 2",
    nominal: 1000000,
    tahun: "2025/2026",
    },
  {
    id: 3,
    kategori: "UKT S1 Pagi",
    nama: "Cicilan 3",
    nominal: 1000000,
    tahun: "2025/2026",
    },
    {
    id: 4,
    kategori: "UKT S1 Pagi",
    nama: "Cicilan 4",
    nominal: 900000,
    tahun: "2025/2026",
    },
    {
    id: 5,
    kategori: "UKT S1 Pagi",
    nama: "Cicilan 5",
    nominal: 1000000,
    tahun: "2025/2026",
    },
    {
    id: 6,
    kategori: "UKT S1 Pagi",
    nama: "Cicilan 6",
    nominal: 1000000,
    tahun: "2025/2026",
    },
    {
    id: 7,
    kategori: "UKT S1 Sore",
    nama: "Cicilan 1",
    nominal: 1000000,
    tahun: "2025/2026",
    },
    {
    id: 8,
    kategori: "UKT S1 Sore",
    nama: "Cicilan 2",
    nominal: 1000000,
    tahun: "2025/2026",
    },
    {
    id: 9,
    kategori: "UKT S1 Sore",
    nama: "Cicilan 3",
    nominal: 1100000,
    tahun: "2025/2026",
    },
    {
    id: 10,
    kategori: "UKT S1 Sore",
    nama: "Cicilan 4",
    nominal: 1000000,
    tahun: "2025/2026",
    },
    {
    id: 11,
    kategori: "UKT S1 Sore",
    nama: "Cicilan 5",
    nominal: 1100000,
    tahun: "2025/2026",
    },
    {
    id: 12,
    kategori: "UKT S1 Sore",
    nama: "Cicilan 6",
    nominal: 1000000,
    tahun: "2025/2026",
    },
    {
        id: 13,
        kategori: "Biaya Pengembangan S1 (Pagi/Sore)",
        nama : "Pengembangan Cicilan 1",
        nominal: 200000,
        tahun: "2025/2026",
    },
    {
        id: 14,
        kategori: "Biaya Pengembangan S1 (Pagi/Sore)",
        nama : "Pengembangan Cicilan 2",
        nominal: 150000,
        tahun: "2025/2026",
    },
    {
        id: 15,
        kategori: "Biaya Pengembangan S1 (Pagi/Sore)",
        nama : "Pengembangan Cicilan 3",
        nominal: 150000,
        tahun: "2025/2026",
    },
    {
        id: 16,
        kategori: "Biaya Pengembangan S1 (Pagi/Sore)",
        nama : "Pengembangan Cicilan 4",
        nominal: 150000,
        tahun: "2025/2026",
    },
    {
        id: 17,
        kategori: "Biaya Pengembangan S1 (Pagi/Sore)",
        nama : "Pengembangan Cicilan 5",
        nominal: 150000,
        tahun: "2025/2026",
    },
    {
        id: 18,
        kategori: "Biaya Pengembangan S1 (Pagi/Sore)",
        nama : "Pengembangan Cicilan 6",
        nominal: 200000,
        tahun: "2025/2026",
    },
    {
        id: 19,
        kategori: "UKT S1 Karyawan",
        nama : "Cicilan 1",
        nominal: 1400000,
        tahun: "2025/2026",
    },
    {
        id: 20,
        kategori: "UKT S1 Karyawan",
        nama : "Cicilan 2",
        nominal: 1300000,
        tahun: "2025/2026",
    },
    {
        id: 21,
        kategori: "UKT S1 Karyawan",
        nama : "Cicilan 3",
        nominal: 1300000,
        tahun: "2025/2026",
    },
    {
        id: 22,
        kategori: "UKT S1 Karyawan",
        nama: "Cicilan 4",
        nominal: 1400000,
        tahun: "2025/2026",
    },
    {
        id: 23,
        kategori: "UKT S1 Karyawan",
        nama: "Cicilan 5",
        nominal: 1300000,
        tahun: "2025/2026",
    },
    {
        id: 24,
        kategori: "UKT S1 Karyawan",
        nama: "Cicilan 6",
        nominal: 1300000,
        tahun: "2025/2026",
    },
    {
        id: 25,
        kategori: "UKT D3 MI Pagi",
        nama: "Cicilan 1",
        nominal: 280000,
        tahun: "2025/2026",
    },
    {
        id: 26,
        kategori: "UKT D3 MI Pagi",
        nama: "Cicilan 2",
        nominal: 380000,
        tahun: "2025/2026",
    },
    {
        id: 27,
        kategori: "UKT D3 MI Pagi",
        nama: "Cicilan 3",
        nominal: 380000,
        tahun: "2025/2026",
    },
    {
        id: 28,
        kategori: "UKT D3 MI Pagi",
        nama: "Cicilan 4",
        nominal: 280000,
        tahun: "2025/2026",
    },
    {
        id: 29,
        kategori: "UKT D3 MI Pagi",
        nama: "Cicilan 5",
        nominal: 900000,
        tahun: "2025/2026",
    },
    {
        id: 30,
        kategori: "UKT D3 MI Pagi",
        nama: "Cicilan 6",
        nominal: 900000,
        tahun: "2025/2026",
    },
    {
        id: 31,
        kategori: "UKT D3 KA Pagi",
        nama: "Cicilan 1",
        nominal: 280000,
        tahun: "2025/2026",
    },
    {
        id: 32,
        kategori: "UKT D3 KA Pagi",
        nama: "Cicilan 2",
        nominal: 380000,
        tahun: "2025/2026",
    },
    {
        id: 33,
        kategori: "UKT D3 KA Pagi",
        nama: "Cicilan 3",
        nominal: 380000,
        tahun: "2025/2026",
    },
    {
        id: 34,
        kategori: "UKT D3 KA Pagi",
        nama: "Cicilan 4",
        nominal: 280000,
        tahun: "2025/2026",
    },
    {
        id: 35,
        kategori: "UKT D3 KA Pagi",
        nama: "Cicilan 5",
        nominal: 380000,
        tahun: "2025/2026",
    },
    {
        id: 36,
        kategori: "UKT D3 KA Pagi",
        nama: "Cicilan 6",
        nominal: 900000,
        tahun: "2025/2026",
    },
    {
        id: 37,
        kategori: "Biaya Pengembangan D3",
        nama: "Cicilan 1",
        nominal: 200000,
        tahun: "2025/2026",
    },
    {
        id: 38,
        kategori: "Biaya Pengembangan D3",
        nama: "Cicilan 2",
        nominal: 100000,
        tahun: "2025/2026",
    },
    {
        id: 39,
        kategori: "Biaya Pengembangan D3",
        nama: "Cicilan 3",
        nominal: 100000,
        tahun: "2025/2026",
    },
    {
        id: 40,
        kategori: "Biaya Pengembangan D3",
        nama: "Cicilan 4",
        nominal: 100000,
        tahun: "2025/2026",
    },
    {
        id: 41,
        kategori: "Biaya Pengembangan D3",
        nama: "Cicilan 5",
        nominal: 100000,
        tahun: "2025/2026",
    },
    {
        id: 42,
        kategori: "Biaya Pengembangan D3",
        nama: "Cicilan 6",
        nominal: 200000,
        tahun: "2025/2026",
    },
    {
        id: 43,
        kategori: "Biaya MOMB",
        nama: "Biaya MOMB",
        nominal: 300000,
        tahun: "2025/2026",
    },
    {
        id: 44,
        kategori: "Biaya Seragam (2 buah)",
        nama: "Biaya Seragam (2 buah)",
        nominal: 350000,
        tahun: "2025/2026",
    }
])

// Fungsi format nominal
const formatNominal = (value) => {
  return value.toLocaleString("id-ID")
}

// Fungsi tombol aksi
const tambahItem = () => {
  alert("Fitur tambah item pembayaran akan dibuat di sini.")
}

const editItem = (item) => {
  alert(`Edit item: ${item.nama}`)
}

const hapusItem = (id) => {
  if (confirm("Yakin ingin menghapus item ini?")) {
    itemList.value = itemList.value.filter((i) => i.id !== id)
  }
}
</script>
