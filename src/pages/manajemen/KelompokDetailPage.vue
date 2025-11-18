<template>
  <div class="p-8 min-h-screen">
    <p class="text-gray-700 font-medium mb-3">Kelola Data Kelompok</p>
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-10">
      <div
        class="rounded-3xl p-6 bg-white/20 backdrop-blur-xl shadow-2xl border border-white/30 
              hover:bg-white/30 transition-all duration-300"
      >
        <h2 class="font-extrabold text-lg mb-4 text-gray-800 drop-shadow">
          Current Users
        </h2>

        <div class="rounded-2xl overflow-hidden border border-white/40 bg-white/10 shadow-inner">
          <div class="bg-white/20 backdrop-blur-lg p-2 text-sm font-semibold text-gray-700">
            Current users ({{ filteredCurrent.length }})
          </div>

          <select
            multiple
            v-model="selectedCurrent"
            class="w-full h-80 p-3 text-sm bg-transparent text-gray-800 outline-none"
          >
            <option
              v-for="u in filteredCurrent"
              :key="u.id"
              :value="u"
              class="hover:bg-white/20 backdrop-blur-md p-1 cursor-pointer"
            >
              {{ u.npm }} - {{ u.nama_lengkap }} ({{ u.angkatan }})
            </option>
          </select>
        </div>

        <div class="mt-4 flex gap-3">
          <input
            v-model="searchCurrent"
            placeholder="Search"
            class="input input-bordered w-full bg-white/40 backdrop-blur-lg input-sm"
          />
          <button 
            class="btn btn-sm btn-outline"
            @click="searchCurrent = ''"
          >
            Clear
          </button>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center gap-8 px-3">

        <button
          class="btn w-32 rounded-2xl bg-gradient-to-r from-blue-500/60 to-indigo-500/60
                  text-white backdrop-blur-lg border border-white/30 shadow-lg
                  hover:scale-110 hover:from-blue-500 hover:to-indigo-500 transition"
          @click="addSelected"
          :disabled="selectedPotential.length === 0"
        >
          Add <i class="fa fa-arrow-right"></i>
        </button>

        <button
          class="btn w-32 rounded-2xl bg-gradient-to-r from-pink-500/60 to-red-500/60
                  text-white backdrop-blur-lg border border-white/30 shadow-lg
                  hover:scale-110 hover:from-pink-500 hover:to-red-500 transition"
          @click="removeSelected"
          :disabled="selectedCurrent.length === 0"
        >
          <i class="fa fa-arrow-left"></i> Remove
        </button>

      </div>

      <div
        class="rounded-3xl p-6 bg-white/20 backdrop-blur-xl shadow-2xl border border-white/30 
              hover:bg-white/30 transition-all duration-300"
      >
        <h2 class="font-extrabold text-lg mb-4 text-gray-800 drop-shadow">
          Potential Users
        </h2>

        <div class="rounded-2xl overflow-hidden border border-white/40 bg-white/10 shadow-inner">
          <div class="bg-white/20 backdrop-blur-lg p-2 text-sm font-semibold text-gray-700">
            Potential matching users ({{ filteredPotential.length }})
          </div>

          <select
            multiple
            v-model="selectedPotential"
            class="w-full h-80 p-3 text-sm bg-transparent text-gray-800 outline-none"
          >
            <option
              v-for="u in filteredPotential"
              :key="u.id"
              :value="u"
              class="hover:bg-white/20 backdrop-blur-md p-1 cursor-pointer"
            >
              {{ u.npm }} - {{ u.nama_lengkap }} ({{ u.angkatan }})
            </option>
          </select>
        </div>

        <div class="mt-4 flex gap-3">
          <input
            v-model="searchPotential"
            placeholder="Search"
            class="input input-bordered w-full bg-white/40 backdrop-blur-lg input-sm"
          />
          <button 
            class="btn btn-sm btn-outline"
            @click="searchPotential = ''"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import { sia } from "../../api/sia";
// Menggunakan import yang disediakan user
import { showLoading, hideLoading } from "../../stores/loading" 

/* ===== STATE ===== */
const currentUsers = ref([]);
const potentialUsers = ref([]);
const selectedCurrent = ref([]);
const selectedPotential = ref([]);
const searchCurrent = ref("");
const searchPotential = ref("");

/* Dummy Data Awal (Untuk Current Users) */
const initialCurrentUsers = [
    { id: 1, npm: "21311021", nama_lengkap: "Aghelinta Bangun", angkatan: "2025" },
    { id: 2, npm: "21311019", nama_lengkap: "Aulia Khusnul Arif", angkatan: "2025" },
];

/* ===== COMPUTED & FILTERING ===== */

// Filtered List Current Users (TETAP)
const filteredCurrent = computed(() =>
  currentUsers.value.filter((u) => {
    const term = searchCurrent.value.toLowerCase();
    return (
      u.npm.toLowerCase().includes(term) ||
      u.nama_lengkap.toLowerCase().includes(term) ||
      String(u.angkatan).includes(term)
    );
  })
);

// Filtered List Potential Users (DIPERBAIKI)
const filteredPotential = computed(() => {
    const term = searchPotential.value.toLowerCase().trim();
    
    // *** PERBAIKAN: Jika term pencarian kosong, kembalikan array kosong. ***
    if (!term) return []; 

    // Jika ada term pencarian, lakukan filter terhadap potentialUsers yang sudah diambil dari API.
    return (potentialUsers.value || []).filter((u) => {
        return (
            u.npm.toLowerCase().includes(term) ||
            u.nama_lengkap.toLowerCase().includes(term) ||
            String(u.angkatan).includes(term)
        );
    });
});

/* ===== MOVE USERS (ADD/REMOVE) DENGAN SWEETALERT2 (TETAP) ===== */

async function addSelected() {
    if (selectedPotential.value.length === 0) {
        return Swal.fire({
            icon: "warning",
            title: "Pilih Pengguna",
            text: "Pilih minimal satu pengguna dari daftar Potential Users.",
        });
    }

    const result = await Swal.fire({
        title: `Tambahkan ${selectedPotential.value.length} Pengguna?`,
        text: "Pengguna akan ditambahkan ke kelompok ini.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Tambahkan",
        cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
        selectedPotential.value.forEach((u) => {
            currentUsers.value.push(u);
            potentialUsers.value = potentialUsers.value.filter((x) => x.id !== u.id);
        });
        selectedPotential.value = [];
        Swal.fire("Berhasil!", "Pengguna berhasil ditambahkan ke kelompok.", "success");
    }
}

async function removeSelected() {
    if (selectedCurrent.value.length === 0) {
        return Swal.fire({
            icon: "warning",
            title: "Pilih Pengguna",
            text: "Pilih minimal satu pengguna dari daftar Current Users.",
        });
    }

    const result = await Swal.fire({
        title: `Hapus ${selectedCurrent.value.length} Pengguna?`,
        text: "Pengguna akan dihapus dari kelompok ini dan kembali ke daftar Potential Users.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
        selectedCurrent.value.forEach((u) => {
            potentialUsers.value.push(u);
            currentUsers.value = currentUsers.value.filter((x) => x.id !== u.id);
        });
        selectedCurrent.value = [];
        Swal.fire("Berhasil!", "Pengguna berhasil dihapus dari kelompok.", "success");
    }
}

/* ===== FUNGSI API (TETAP) ===== */

async function fetchPotentialUsers() {
    showLoading("Singkronisasi Data Mahasiswa...")
    let allUsers = [];
    try {
        const response = await sia.get("/users");
        allUsers = Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error("Gagal mengambil data mahasiswa:", error);
        allUsers = [
            { id: 3, npm: "21311045", nama_lengkap: "Budi Santoso", angkatan: "2025" },
            { id: 4, npm: "21311001", nama_lengkap: "Citra Dewi", angkatan: "2025" },
            { id: 5, npm: "20311050", nama_lengkap: "Dian Permata", angkatan: "2024" },
            { id: 6, npm: "20311051", nama_lengkap: "Eka Setiawan", angkatan: "2024" },
        ];
    } finally {
      hideLoading()
    }
    
    const currentIds = new Set(currentUsers.value.map(u => u.id));

    // Data semua potential user disimpan di sini
    potentialUsers.value = allUsers.filter(u => !currentIds.has(u.id));
}

/* ===== LIFECYCLE HOOKS (TETAP) ===== */
onMounted(() => {
    currentUsers.value = initialCurrentUsers; 
    fetchPotentialUsers();
});
</script>