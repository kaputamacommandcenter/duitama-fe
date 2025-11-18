<template>
  <div class="p-4 md:p-8 min-h-screen bg-gray-50">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Data Mahasiswa</h1>

    <div
      class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl p-6"
    >
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
        <p class="text-gray-700 font-medium">Daftar Mahasiswa Aktif ({{ filteredAndSortedMahasiswa.length }})</p>

        <div class="flex flex-wrap items-center gap-3">
          <select v-model="perPage" class="select select-bordered select-sm w-20">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>

          <input
            v-model="search"
            type="text"
            class="input input-bordered input-sm w-56"
            placeholder="Cari NPM atau Nama..."
          />
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-blue-50 text-blue-900">
              <th class="w-12 text-center">No</th>
              
              <th @click="sortBy('npm')" class="cursor-pointer">
                NPM
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'npm'
                      ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down')
                      : 'fa-sort',
                  ]"
                ></i>
              </th>
              
              <th @click="sortBy('nama_mahasiswa')" class="cursor-pointer">
                Nama Mahasiswa
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'nama_mahasiswa'
                      ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down')
                      : 'fa-sort',
                  ]"
                ></i>
              </th>
              
              <th @click="sortBy('angkatan')" class="cursor-pointer">
                Angkatan
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'angkatan'
                      ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down')
                      : 'fa-sort',
                  ]"
                ></i>
              </th>
              
              <th class="text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr 
                v-for="(mahasiswa, index) in paginatedData" 
                :key="mahasiswa.npm" 
                class="hover:bg-blue-50/60 transition"
            >
              <td class="text-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td class="font-mono text-gray-700">{{ mahasiswa.npm }}</td>
              <td>{{ mahasiswa.nama_lengkap }}</td>
              <td>{{ mahasiswa.angkatan }}</td>
              <td class="text-center space-x-2">
                <button 
                    class="btn btn-xs bg-indigo-500 hover:bg-indigo-600 text-white" 
                    title="Lihat Detail"
                    @click="goToDetail(mahasiswa.npm)"
                >
                  <i class="fa-solid fa-eye"></i> Lihat Detail
                </button>
              </td>
            </tr>
            <tr v-if="paginatedData.length === 0">
              <td colspan="5" class="text-center text-gray-500 py-4">
                Tidak ada data mahasiswa ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Menampilkan {{ paginatedData.length }} dari {{ filteredAndSortedMahasiswa.length }} data
        </div>

        <div class="flex items-center gap-2">
          <button
            class="btn btn-xs"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            « Prev
          </button>

          <span class="text-sm">
            Halaman {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            class="btn btn-xs"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next »
          </button>
        </div>
      </div>
    </div>
    
    </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // PENTING: Import useRouter
import { sia } from "../api/sia"; 
import LoadingOverlay from "../components/LoadingOverlay.vue"
import { showLoading, hideLoading } from "../stores/loading"

// PENTING: Inisialisasi router
const router = useRouter();


/* ===== STATE UTAMA ===== */
const mahasiswaList = ref([]);
const search = ref("");
const currentPage = ref(1);
const perPage = ref(10); 
const sortKey = ref(null);
const sortDirection = ref(1); 

// Catatan: Anda perlu mendefinisikan dummyMahasiswaData jika digunakan saat error/testing.
const dummyMahasiswaData = [
    { npm: '20210001', nama_lengkap: 'Budi Santoso', angkatan: 2021 },
    { npm: '20220002', nama_lengkap: 'Siti Rahmawati', angkatan: 2022 },
    { npm: '20230003', nama_lengkap: 'Joko Widodo', angkatan: 2023 },
    { npm: '20230004', nama_lengkap: 'Ayu Lestari', angkatan: 2023 },
    { npm: '20210005', nama_lengkap: 'Fajar Kurniawan', angkatan: 2021 },
];


/* ===== FUNGSI ROUTING BARU ===== */

/**
 * Navigasi ke halaman detail pembayaran menggunakan NPM.
 * ASUMSI: Ada route yang terdaftar di Vue Router dengan path: '/pembayaran/:npm'
 * @param {string} npm - Nomor Pokok Mahasiswa
 */
const goToDetail = (npm) => {
  // MODIFIKASI: Ganti nama route menjadi 'detail-pembayaran'
  router.push({ 
    name: 'detail-pembayaran', 
    params: { npm: npm } 
  });
};


/* ===== FUNGSI API (PENGAMBILAN DATA) - TETAP SAMA ===== */

async function fetchMahasiswaData() {
  showLoading("Singkronisasi Data Mahasiswa...")
    try {
        const response = await sia.get("/users"); 
        
        if (response.data && Array.isArray(response.data.data)) {
            // Mapping menggunakan properti nama_lengkap
            mahasiswaList.value = response.data.data.map(m => ({
                npm: m.npm,
                nama_lengkap: m.nama_lengkap || m.nama || 'Nama Tidak Tersedia',
                angkatan: m.angkatan || 'N/A'
            }));
        } else {
            console.warn("API response format unexpected. Using dummy data.");
            mahasiswaList.value = dummyMahasiswaData;
        }

    } catch (error) {
        console.error("Gagal mengambil data mahasiswa:", error);
        mahasiswaList.value = dummyMahasiswaData;
    } finally {
      hideLoading()
    }
}


/* ===== LIFECYCLE HOOKS ===== */
onMounted(() => {
    fetchMahasiswaData();
});


/* ===== FILTERING, SORTING, PAGINATION LOGIC - TETAP SAMA ===== */

// 1. Filtering (Pencarian)
const filteredMahasiswa = computed(() => {
    if (!search.value) return mahasiswaList.value;

    const term = search.value.toLowerCase();
    return mahasiswaList.value.filter((m) =>
        m.npm.toLowerCase().includes(term) ||
        m.nama_lengkap.toLowerCase().includes(term) || 
        String(m.angkatan).includes(term)
    );
});

// 2. Sorting (Penyortiran)
const filteredAndSortedMahasiswa = computed(() => {
    let data = [...filteredMahasiswa.value];
    if (sortKey.value) {
        data.sort((a, b) => {
            let aVal = a[sortKey.value] || '';
            let bVal = b[sortKey.value] || '';

            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();

            if (aVal < bVal) return -1 * sortDirection.value;
            if (aVal > bVal) return 1 * sortDirection.value;
            return 0;
        });
    }
    return data;
});

const sortBy = (key) => {
    if (sortKey.value === key) {
        sortDirection.value = sortDirection.value * -1;
    } else {
        sortKey.value = key;
        sortDirection.value = 1;
    }
    currentPage.value = 1; 
};

// 3. Pagination (Pembagian Halaman)
const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredAndSortedMahasiswa.value.length / perPage.value))
);

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    return filteredAndSortedMahasiswa.value.slice(start, start + perPage.value);
});

// Watcher untuk reset halaman saat filter/perPage berubah
watch([search, perPage], () => {
    currentPage.value = 1;
});
</script>