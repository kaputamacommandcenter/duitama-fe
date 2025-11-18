<template>
  <div class="p-4 md:p-8 min-h-screen">
    <div v-if="loadingDetail" class="flex justify-center items-center h-screen -mt-20">
      <div class="text-center">
        <span class="loading loading-spinner loading-lg text-indigo-500"></span>
        <p class="mt-4 text-indigo-600 font-semibold">Memuat detail pembayaran untuk NPM {{ npm }}...</p>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-20 bg-white shadow-xl rounded-xl max-w-4xl mx-auto">
      <i class="fa-solid fa-triangle-exclamation text-red-500 text-4xl mb-4"></i>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h1>
      <p class="text-red-600">{{ error }}</p>
      <button @click="router.back()" class="btn btn-sm btn-ghost mt-4 text-indigo-600">
        <i class="fa-solid fa-arrow-left mr-1"></i> Kembali
      </button>
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <div class="flex items-center mb-6">
        <button @click="router.back()" class="btn btn-ghost btn-circle mr-2 text-gray-600 hover:text-indigo-600">
          <i class="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 class="text-3xl font-extrabold text-gray-800">Detail Pembayaran UKT</h1>
      </div>

      <div class="bg-indigo-50 p-5 rounded-xl shadow-lg mb-6 border border-indigo-200">
        <h2 class="text-xl font-bold text-indigo-800 mb-3 flex items-center">
          <i class="fa-solid fa-user-graduate mr-2"></i> {{ selectedMahasiswa.nama_lengkap }}
        </h2>
        <div class="flex justify-between text-sm text-gray-700">
          <p><span class="font-semibold">NPM:</span> {{ selectedMahasiswa.npm }}</p>
          <p><span class="font-semibold">Angkatan:</span> {{ selectedMahasiswa.angkatan }}</p>
        </div>
      </div>

      <div class="card bg-white shadow-xl mb-8">
        <div class="card-body p-4 md:p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-3">Ringkasan Pembayaran</h3>
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr class="text-indigo-600 font-extrabold text-sm border-b-2 border-indigo-200">
                  <th class="w-1/3">Total UKT</th>
                  <th class="w-1/3">Total Dibayar</th>
                  <th class="w-1/3">Sisa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-xl font-bold text-indigo-700">{{ formatCurrency(totalUkt) }}</td>
                  <td class="text-xl font-bold text-success">{{ formatCurrency(totalDibayar) }}</td>
                  <td>
                    <p class="text-xl font-bold" :class="totalUkt - totalDibayar === 0 ? 'text-gray-800' : 'text-error'">
                      {{ formatCurrency(totalUkt - totalDibayar) }}
                    </p>
                    <span class="text-xs font-semibold" :class="totalUkt - totalDibayar === 0 ? 'text-success' : 'text-error'">
                      ({{ totalUkt - totalDibayar === 0 ? 'LUNAS' : 'BELUM LUNAS' }})
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-4">Daftar Cicilan UKT</h2>
      
      <div class="bg-white shadow-xl rounded-xl overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-100 text-gray-600 text-sm font-semibold">
              <th>#</th>
              <th>Nama Cicilan</th>
              <th>Nominal</th>
              <th>Status</th>
              <th>Tgl. Bayar</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in detailPembayaran" 
              :key="item.cicilan"
              class="border-b transition duration-150"
              :class="item.status.toLowerCase() === 'lunas' ? 'hover:bg-green-50/50' : 'hover:bg-indigo-50/50'"
            >
              <td>{{ item.cicilan }}</td>
              <td class="font-semibold text-gray-800">{{ item.nama_cicilan }}</td>
              <td class="font-bold text-base" :class="item.status.toLowerCase() === 'lunas' ? 'text-green-600' : 'text-indigo-600'">
                {{ formatCurrency(item.nominal) }}
              </td>
              <td>
                <span 
                    class="badge font-semibold" 
                    :class="getStatusBadgeClass(item.status)"
                >
                    {{ item.status }}
                </span>
              </td>
              <td>
                <span class="font-mono text-xs">{{ item.tanggal_bayar ? formatDate(item.tanggal_bayar) : '-' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="detailPembayaran.length === 0 && !loadingDetail" class="text-center text-gray-500 py-8">
          <i class="fa-solid fa-info-circle mb-2 text-xl"></i>
          <p>Data pembayaran UKT tidak ditemukan untuk mahasiswa ini.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRoute dan useRouter
import { sia } from "../api/sia"; 
import { showLoading, hideLoading } from "../stores/loading";

const route = useRoute();
const router = useRouter();

/* ===== STATE DETAIL ===== */
const npm = ref(route.params.npm); // Ambil NPM dari parameter URL
const selectedMahasiswa = ref({ npm: npm.value, nama_lengkap: 'Memuat...', angkatan: 'N/A' });
const detailPembayaran = ref([]);
const loadingDetail = ref(false);
const error = ref(null);

/* ===== COMPUTED PROPERTIES ===== */

// Hitung Total UKT (Total semua nominal cicilan)
const totalUkt = computed(() => {
    return detailPembayaran.value.reduce((sum, item) => sum + item.nominal, 0);
});

// Hitung Total yang Sudah Dibayar (hanya cicilan yang statusnya 'Lunas')
const totalDibayar = computed(() => {
    return detailPembayaran.value
        .filter(item => item.status.toLowerCase() === 'lunas')
        .reduce((sum, item) => sum + item.nominal, 0);
});


/* ===== FUNGSI API (PENGAMBILAN DATA) ===== */

async function fetchDetailData() {
    loadingDetail.value = true;
    error.value = null;
    detailPembayaran.value = [];
    
    // Asumsikan data mahasiswa lengkap harus diambil lagi jika tidak dilewatkan dari halaman sebelumnya
    // Dalam implementasi nyata, endpoint detail UKT mungkin sudah menyertakan data mahasiswa.
    
    try {
        // --- 1. Ambil Data Detail Pembayaran UKT ---
        // ASUMSI: Endpoint API untuk detail UKT adalah /pembayaran/ukt/:npm
        // Ganti dengan endpoint API Anda yang sebenarnya
        // const response = await sia.get(`/pembayaran/ukt/${npm.value}`); 
        
        // Simulasikan delay API
        await new Promise(resolve => setTimeout(resolve, 800)); 

        // Untuk tujuan demonstrasi, kita gunakan data simulasi
        const dummyData = generateDummyPembayaran(npm.value); 
        detailPembayaran.value = dummyData;
        
        // --- 2. Update Informasi Mahasiswa (Jika diperlukan) ---
        // Biasanya, data mahasiswa juga disertakan dalam respons, tapi kita simulasikan:
        const dummyMhs = dummyMahasiswaData.find(m => m.npm === npm.value) || { npm: npm.value, nama_lengkap: 'Nama Tidak Dikenal', angkatan: 'N/A' };
        selectedMahasiswa.value = dummyMhs;

        if (detailPembayaran.value.length === 0) {
            error.value = `Tidak ada data pembayaran UKT ditemukan untuk NPM ${npm.value}.`;
        }

    } catch (err) {
        console.error("Gagal mengambil detail pembayaran:", err);
        error.value = "Gagal terhubung ke server atau data tidak valid.";
        // Fallback data simulasi untuk tampilan jika error
        detailPembayaran.value = generateDummyPembayaran(npm.value); 
    } finally {
        loadingDetail.value = false;
    }
}


/* ===== FUNGSI BANTUAN (HELPER) - Diambil dari komponen sebelumnya ===== */

const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch {
      return dateString; // Fallback jika format tanggal tidak valid
    }
};

const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-neutral';
    switch(status.toLowerCase()) {
        case 'lunas':
            return 'badge-success text-white';
        case 'belum lunas':
            return 'badge-warning';
        case 'terlambat':
            return 'badge-error text-white';
        default:
            return 'badge-neutral';
    }
};

/* ===== DUMMY DATA (HAPUS JIKA API ASLI SUDAH SIAP) ===== */
const dummyMahasiswaData = [
    { npm: '20210001', nama_lengkap: 'Budi Santoso', angkatan: 2021 },
    { npm: '20220002', nama_lengkap: 'Siti Rahmawati', angkatan: 2022 },
    { npm: '20230003', nama_lengkap: 'Joko Widodo', angkatan: 2023 },
    { npm: '20230004', nama_lengkap: 'Ayu Lestari', angkatan: 2023 },
    { npm: '20210005', nama_lengkap: 'Fajar Kurniawan', angkatan: 2021 },
];

const generateDummyPembayaran = (npm) => {
    const totalCicilan = 6;
    const nominalUKT = 15000000;
    const nominalPerCicilan = nominalUKT / totalCicilan;
    
    const dummyData = [];
    for (let i = 1; i <= totalCicilan; i++) {
        let status = 'Belum Lunas';
        let tanggal_bayar = null;
        
        if (npm.endsWith('1') || npm.endsWith('5')) { 
            status = 'Lunas';
            tanggal_bayar = `2025-08-${i < 10 ? '0' + i : i}`;
        } else if (npm.endsWith('2') && i <= 3) { 
            status = 'Lunas';
            tanggal_bayar = `2025-09-${i < 10 ? '1' + i : i}`;
        } else if (npm.endsWith('3') && i === 1) { 
            status = 'Lunas';
            tanggal_bayar = `2025-07-20`;
        }
        
        dummyData.push({
            cicilan: i,
            nama_cicilan: `UKT Cicilan ${i}`,
            nominal: nominalPerCicilan,
            tanggal_bayar: tanggal_bayar,
            status: status
        });
    }
    return dummyData;
}


/* ===== LIFECYCLE HOOKS ===== */
onMounted(() => {
    if (npm.value) {
        fetchDetailData();
    } else {
        error.value = "NPM tidak ditemukan di URL.";
    }
});
</script>